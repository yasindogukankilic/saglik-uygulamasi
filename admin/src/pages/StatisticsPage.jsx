// src/pages/SessionsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Users, Eye, Activity,
  Download, RefreshCw, Plus, Expand, Trash2
} from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import StatCard   from '../components/ui/StatCard';
import Card       from '../components/ui/Card';
import Button     from '../components/ui/Button';
import SearchBar  from '../components/ui/SearchBar';
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
    const latest        = sessions[0] || null;

    return { totalSessions, totalStudents, avgAccuracy, latest };
  }, [sessions]);

  const handleCreateDone = (createdSession) => {
    // Modal zaten QR + link gösteriyor; ayrıca detay modalı da açalım:
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

  /* ---------------- ui ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Seans İstatistikleri"
        description="Sınav seanslarını ve performansını izleyin"
        icon={BarChart3}
        actions={[
          <Button key="new" variant="primary" icon={Plus}
                  onClick={() => setIsCreateOpen(true)}>
            Yeni Seans Oluştur
          </Button>,
          <Button key="refresh" variant="secondary" icon={RefreshCw}
                  onClick={() => window.location.reload()}>
            Yenile
          </Button>
        ]}
      />

      {/* METRİKLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Seans"
          value={metrics.totalSessions.toString()}
          change={metrics.latest ? `Son: ${metrics.latest.sessionName}` : '—'}
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
          icon={Eye}
          iconBgColor={iconBgs.purple}
          iconColor={iconColors.purple}
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
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Seans Listesi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Seans Adı', 'Tarih', 'Öğrenci', 'Doğruluk', '']
                  .map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium
                                           text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{s.sessionName}</td>
                  <td className="px-6 py-4">
                    {new Date(s.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">{s.studentCount}</td>
                  <td className="px-6 py-4">%{s.accuracyRate}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button title="Detay"
                              onClick={() => handleExpand(s)}
                              className="text-blue-600 hover:text-blue-900 p-1
                                         hover:bg-blue-50 rounded transition-colors">
                        <Expand className="w-4 h-4" />
                      </button>
                      <button title="Excel İndir"
                              onClick={() => exportSessionExcel(s)}
                              className="text-emerald-600 hover:text-emerald-900 p-1
                                         hover:bg-emerald-50 rounded transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button title="Sil"
                              onClick={() => handleDelete(s.id)}
                              className="text-red-600 hover:text-red-900 p-1
                                         hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500">
                  {search ? 'Arama kriterine uygun seans yok' : 'Henüz seans yok'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
