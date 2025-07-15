import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText, Plus, Eye, Edit, LucideActivity, Trash2, Calendar, User
} from 'lucide-react';

import PageHeader        from '../components/ui/PageHeader';
import StatCard          from '../components/ui/StatCard';
import SearchBar         from '../components/ui/SearchBar';
import Card              from '../components/ui/Card';
import Button            from '../components/ui/Button';
import ContentFormModal  from '../components/ui/ContentFormModal';
import ContentViewModal  from '../components/ui/ContentViewModal';
import { iconBgs, iconColors } from '../utils/styles';

import { db } from '../firebase';
import {
  collection, onSnapshot, orderBy, query, deleteDoc, doc
} from 'firebase/firestore';

export default function ContentPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [viewOpen,   setViewOpen]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [contents,   setContents]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [isMobile,   setIsMobile]   = useState(false);

  /* ---------- responsive check ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---------- realtime snapshot ---------- */
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'contents'), orderBy('createdAt', 'desc')),
      snap => setContents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  /* ---------- silme ---------- */
  const removeContent = async row => {
    if (window.confirm(`${row.name} silinsin mi?`)) {
      await deleteDoc(doc(db, 'contents', row.id));
    }
  };

  /* ---------- filtre & istatistik ---------- */
  const list = contents.filter(c =>
    `${c.name} ${c.creator || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const total   = contents.length;
    const totalQ  = contents.reduce((s, c) => s + (c.questionCount || 0), 0);
    const recent  = contents.filter(c => {
      const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      const pastWeek = new Date();
      pastWeek.setDate(pastWeek.getDate() - 7);
      return d >= pastWeek;
    }).length;
    const avgQuestions = total > 0 ? Math.round(totalQ / total) : 0;
    return { total, totalQ, recent, avgQuestions };
  }, [contents]);

  const cols = [
    { key: 'name', title: 'İçerik İsmi' },
    {
      key   : 'createdAt',
      title : 'Tarihi',
      render: v => {
        const dateObj = v?.toDate ? v.toDate() : new Date(v);
        return dateObj.toLocaleDateString('tr-TR');
      }
    },
    { key: 'questionCount', title: 'Soru' },
    { key: 'creator',       title: 'Oluşturan' }
  ];

  /* ---------- mobile card component ---------- */
  const MobileContentCard = ({ content }) => (
    <Card className="mb-4" hover>
      <Card.Content className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
              {content.name}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
              <Calendar className="w-3 h-3" />
              <span>
                {(() => {
                  const dateObj = content.createdAt?.toDate ? content.createdAt.toDate() : new Date(content.createdAt);
                  return dateObj.toLocaleDateString('tr-TR');
                })()}
              </span>
            </div>
          </div>
          <div className="flex space-x-1 ml-2">
            <button title="Görüntüle"
                    onClick={() => { setSelected(content); setViewOpen(true); }}
                    className="text-blue-600 hover:text-blue-900 p-2
                               hover:bg-blue-50 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button title="Düzenle"
                    onClick={() => { setSelected(content); setEditOpen(true); }}
                    className="text-indigo-600 hover:text-indigo-900 p-2
                               hover:bg-indigo-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button title="Sil"
                    onClick={() => removeContent(content)}
                    className="text-red-600 hover:text-red-900 p-2
                               hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {content.questionCount || 0} soru
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">
              {content.creator || 'Bilinmiyor'}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  /* ---------- render ---------- */
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <PageHeader
        title="İçerik Yönetimi"
        description="Sınav içeriklerini yönetin"
        icon={FileText}
        actions={[
          <Button
            key="new"
            variant="primary"
            icon={Plus}
            size={isMobile ? "sm" : "md"}
            onClick={() => { setSelected(null); setCreateOpen(true); }}
          >
            {isMobile ? "Yeni" : "Yeni İçerik"}
          </Button>
        ]}
      />

      {/* kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Toplam İçerik"
          value={stats.total.toString()}
          change={`+${stats.recent} bu hafta`}
          changeType={stats.recent > 0 ? 'positive' : 'neutral'}
          icon={FileText}
          iconBgColor={iconBgs.blue}
          iconColor={iconColors.primary}
        />
        <StatCard
          title="Toplam Soru"
          value={stats.totalQ.toString()}
          change="Tüm içerikler"
          changeType="neutral"
          icon={Eye}
          iconBgColor={iconBgs.green}
          iconColor={iconColors.success}
        />
        <StatCard
          title="Aktif İçerik"
          value={stats.total.toString()}
          change="Kullanıma hazır"
          changeType="positive"
          icon={LucideActivity}
          iconBgColor={iconBgs.purple}
          iconColor={iconColors.purple}
        />
        <StatCard
          title="Ortalama Soru"
          value={stats.avgQuestions.toString()}
          change="İçerik başına"
          changeType="neutral"
          icon={FileText}
          iconBgColor={iconBgs.orange}
          iconColor={iconColors.orange}
        />
      </div>

      {/* arama */}
      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="İçerik ara…"
        showFilterButton={false}
      />

      {/* MOBILE CARDS / DESKTOP TABLE */}
      {isMobile ? (
        /* MOBILE CARDS */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-gray-800">
              İçerik Listesi ({list.length})
            </h3>
          </div>
          
          {list.length === 0 ? (
            <Card>
              <Card.Content className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {search ? 'Arama kriterine uygun içerik yok' : 'Henüz içerik eklenmedi'}
                </p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-3">
              {list.map(content => (
                <MobileContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP TABLE */
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">İçerik Listesi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {cols.map(c => (
                    <th
                      key={c.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {c.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {cols.map(c => (
                      <td
                        key={c.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {c.render ? c.render(row[c.key], row) : row[c.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          title="Görüntüle"
                          onClick={() => { setSelected(row); setViewOpen(true); }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Düzenle"
                          onClick={() => { setSelected(row); setEditOpen(true); }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Sil"
                          onClick={() => removeContent(row)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {search ? 'Arama kriterine uygun içerik yok' : 'Henüz içerik eklenmedi'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* modallar */}
      <ContentFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ContentFormModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        editData={selected}
      />
      <ContentViewModal
        isOpen={viewOpen}
        onClose={() => { setViewOpen(false); setSelected(null); }}
        contentData={selected}
      />
    </div>
  );
}