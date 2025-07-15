// src/pages/SessionsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Users, Eye, Activity,
  Download, RefreshCw, Plus, Expand, Trash2, Calendar, Target
} from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import StatCard   from '../components/ui/StatCard';
import Card       from '../components/ui/Card';
import Button     from '../components/ui/Button';
import SearchBar  from '../components/ui/SearchBar';
import Table      from '../components/ui/Table';
import SessionDetailModal from '../components/ui/SessionDetailModal';
import CreateSessionModal  from '../components/ui/CreateSessionModal';
import { iconBgs, iconColors } from '../utils/styles';

import { db } from '../firebase';
import {
  collection, query, orderBy, onSnapshot,
  deleteDoc, doc
} from 'firebase/firestore';

import { exportSessionExcel } from '../utils/exportSessionExcel';

const SessionsPage = () => {
  /* ---------------- state ---------------- */
  const [sessions,       setSessions]       = useState([]);
  const [contents,       setContents]       = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [isDetailOpen,   setIsDetailOpen]   = useState(false);
  const [isCreateOpen,   setIsCreateOpen]   = useState(false);
  const [search,         setSearch]         = useState('');
  const [isMobile,       setIsMobile]       = useState(false);

  /* ---------- responsive check ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---------- real-time Firestore streams ---------- */
  useEffect(() => {
    const unsubSessions = onSnapshot(
      query(collection(db, 'sessions'), orderBy('createdAt', 'desc')),
      snap =>
        setSessions(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        )
    );

    const unsubContents = onSnapshot(
      collection(db, 'contents'),
      snap => setContents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubSessions(); unsubContents(); };
  }, []);

  /* ---------------- helpers ---------------- */
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalStudents = sessions.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const avgAccuracy   = totalSessions
        ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracyRate || 0), 0) / totalSessions)
        : 0;
    const avgStudents   = totalSessions 
        ? Math.round(totalStudents / totalSessions)
        : 0;

    return { totalSessions, totalStudents, avgAccuracy, avgStudents };
  }, [sessions]);

  const handleCreateDone = (createdSession) => {
    setSelected(createdSession);
    setIsDetailOpen(true);
  };

  const handleExpand = (session) => {
    setSelected(session);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu seansı silmek istediğinize emin misiniz?')) {
      await deleteDoc(doc(db, 'sessions', id));
    }
  };

  /* ---------------- filtrelenmiş liste ---------------- */
  const list = sessions.filter(
    s =>
      s.sessionName.toLowerCase().includes(search.toLowerCase()) ||
      (s.date || '').includes(search)
  );

  /* ---------------- tablo kolonları ---------------- */
  const columns = [
    {
      key: 'sessionName',
      title: 'Seans Adı'
    },
    {
      key: 'date',
      title: 'Tarih',
      render: (value) => {
        return new Date(value).toLocaleDateString('tr-TR');
      }
    },
    {
      key: 'studentCount',
      title: 'Öğrenci Sayısı'
    },
    {
      key: 'accuracyRate',
      title: 'Doğruluk Oranı',
      render: (value) => `%${value || 0}`
    }
  ];

  /* ---------------- ui ---------------- */
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* HEADER */}
      <PageHeader
        title="Seans İstatistikleri"
        description="Sınav seanslarını ve performansını izleyin"
        icon={BarChart3}
        actions={[
          <Button key="new" variant="primary" icon={Plus}
                  size={isMobile ? "sm" : "md"}
                  onClick={() => setIsCreateOpen(true)}>
            {isMobile ? "Yeni" : "Yeni Seans Oluştur"}
          </Button>,
          <Button key="refresh" variant="secondary" icon={RefreshCw}
                  size={isMobile ? "sm" : "md"}
                  onClick={() => window.location.reload()}>
            {isMobile ? "" : "Yenile"}
          </Button>
        ]}
      />

      {/* METRİKLER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Toplam Seans"
          value={metrics.totalSessions.toString()}
          change={`${metrics.totalSessions} aktif`}
          changeType="neutral"
          icon={BarChart3}
          iconBgColor={iconBgs.blue}
          iconColor={iconColors.primary}
        />
        <StatCard
          title="Toplam Öğrenci"
          value={metrics.totalStudents.toString()}
          change={`${metrics.totalSessions} seans`}
          changeType="neutral"
          icon={Users}
          iconBgColor={iconBgs.green}
          iconColor={iconColors.success}
        />
        <StatCard
          title="Ortalama Doğruluk"
          value={`%${metrics.avgAccuracy}`}
          change="Tüm seanslar"
          changeType={
            metrics.avgAccuracy >= 80
              ? 'positive'
              : metrics.avgAccuracy >= 60
              ? 'neutral'
              : 'negative'
          }
          icon={Target}
          iconBgColor={iconBgs.purple}
          iconColor={iconColors.purple}
        />
        <StatCard
          title="Ortalama Katılım"
          value={metrics.avgStudents.toString()}
          change="Seans başına"
          changeType="neutral"
          icon={Activity}
          iconBgColor={iconBgs.orange}
          iconColor={iconColors.orange}
        />
      </div>

      {/* ARAMA */}
      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Seans ara..."
        showFilterButton={false}
      />

      {/* TABLO */}
      <Table
        columns={columns}
        data={list}
        rowActions={(session) => [
          { 
            label: 'Detay', 
            icon: Expand, 
            onClick: () => handleExpand(session) 
          },
          { 
            label: 'Excel İndir', 
            icon: Download, 
            onClick: () => exportSessionExcel(session) 
          },
          { 
            label: 'Sil', 
            icon: Trash2, 
            danger: true, 
            onClick: () => handleDelete(session.id) 
          }
        ]}
        emptyMessage={search ? 'Arama kriterine uygun seans yok' : 'Henüz seans yok'}
        emptyIcon={BarChart3}
      />

      {/* MODALLAR */}
      <CreateSessionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        contents={contents}
        onCreated={handleCreateDone}
      />
      <SessionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sessionData={selected}
      />
    </div>
  );
};

export default SessionsPage;