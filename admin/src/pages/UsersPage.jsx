import React, { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Edit, Trash2, Mail, Shield, Calendar } from 'lucide-react';
import PageHeader    from '../components/ui/PageHeader';
import StatCard      from '../components/ui/StatCard';
import SearchBar     from '../components/ui/SearchBar';
import Table         from '../components/ui/Table';
import UserFormModal from '../components/ui/UserFormModal';
import Button        from '../components/ui/Button';
import Card          from '../components/ui/Card';
import { iconBgs, iconColors } from '../utils/styles';

import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase';
import {
  collection, query, orderBy, onSnapshot,
  deleteDoc, doc
} from 'firebase/firestore';

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser,  setEditUser]  = useState(null);
  const [users,     setUsers]     = useState([]);
  const [search,    setSearch]    = useState('');
  const [isMobile,  setIsMobile]  = useState(false);

  /* ---------- responsive check ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---- Firestore stream ---- */
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  /* ---- istatistik ---- */
  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    const now = new Date();
    const thisMonth = users.filter((u) => {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, active: total, thisMonth, adminCount, userCount };
  }, [users]);

  /* ---- filtre ---- */
  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.title || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ---- kolonlar ---- */
  const columns = [
    {
      key   : 'name',
      title : 'Ad Soyad',
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'title',  title: 'Ünvan' },
    { key: 'email',  title: 'E-posta' },
    { key: 'role',   title: 'Rol',    type:'badge',
      getBadgeClass: (r) => r === 'admin'
        ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    },
    { key: 'createdAt', title: 'Oluşturma',
      render: (v) => {
        const d = v?.toDate ? v.toDate() : new Date(v);
        return d.toLocaleDateString('tr-TR');
      }
    },
  ];

  /* ---- satır aksiyonları ---- */
  const handleEdit = (row) => { setEditUser(row); setModalOpen(true); };

  const handleDelete = async (row) => {
    if (!window.confirm(`${row.firstName} ${row.lastName} silinsin mi?`)) return;

    /* 1) Auth hesabını sil */
    if (row.uid) {
      try {
        const delAuth = httpsCallable(functions, 'deleteAuthUser');
        await delAuth({ uid: row.uid });
      } catch (err) {
        alert('Auth kullanıcı silinirken hata: ' + err.message);
        return;
      }
    }

    /* 2) Firestore kaydını sil */
    await deleteDoc(doc(db, 'users', row.id));
  };

  /* ---- mobile card component ---- */
  const MobileUserCard = ({ user }) => (
    <Card className="mb-4" hover>
      <Card.Content className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500 mb-2 truncate">
              {user.title || 'Ünvan belirtilmemiş'}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                ${user.role === 'admin' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'}`}>
                {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
              </span>
            </div>
          </div>
          <div className="flex space-x-1 ml-2">
            <button title="Düzenle"
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 p-2
                               hover:bg-indigo-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button title="Sil"
                    onClick={() => handleDelete(user)}
                    className="text-red-600 hover:text-red-900 p-2
                               hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">
              {user.email}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              {(() => {
                const d = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                return d.toLocaleDateString('tr-TR');
              })()}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  /* ---- UI ---- */
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* HEADER */}
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Admin hesaplarını yönetin"
        icon={Users}
        actions={[
          <Button
            key="new"
            variant="primary"
            icon={Plus}
            size={isMobile ? "sm" : "md"}
            onClick={() => { setEditUser(null); setModalOpen(true); }}
          >
            {isMobile ? "Yeni" : "Yeni Admin"}
          </Button>,
        ]}
      />

      {/* KARTLAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.total.toString()}
          change={`+${stats.thisMonth} bu ay`}
          changeType={stats.thisMonth > 0 ? 'positive' : 'neutral'}
          icon={Users}
          iconBgColor={iconBgs.blue}
          iconColor={iconColors.primary}
        />
        <StatCard
          title="Admin"
          value={stats.adminCount.toString()}
          change="Yönetici"
          changeType="positive"
          icon={Shield}
          iconBgColor={iconBgs.green}
          iconColor={iconColors.success}
        />
        <StatCard
          title="Kullanıcı"
          value={stats.userCount.toString()}
          change="Normal kullanıcı"
          changeType="neutral"
          icon={Users}
          iconBgColor={iconBgs.purple}
          iconColor={iconColors.purple}
        />
        <StatCard
          title="Bu Ay Eklenen"
          value={stats.thisMonth.toString()}
          change="Yeni kayıt"
          changeType={stats.thisMonth > 0 ? 'positive' : 'neutral'}
          icon={Plus}
          iconBgColor={iconBgs.orange}
          iconColor={iconColors.orange}
        />
      </div>

      {/* ARAMA */}
      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Kullanıcı ara..."
        showFilterButton={false}
      />

      {/* MOBILE CARDS / DESKTOP TABLE */}
      {isMobile ? (
        /* MOBILE CARDS */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Kullanıcı Listesi ({filtered.length})
            </h3>
          </div>
          
          {filtered.length === 0 ? (
            <Card>
              <Card.Content className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {search ? 'Arama kriterine uygun kullanıcı yok' : 'Henüz kullanıcı eklenmedi'}
                </p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(user => (
                <MobileUserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP TABLE */
        <Table
          columns={columns}
          data={filtered}
          rowActions={(row) => [
            { label:'Düzenle', icon: Edit,   onClick: () => handleEdit(row) },
            { label:'Sil',     icon: Trash2, danger:true, onClick: () => handleDelete(row) },
          ]}
        />
      )}

      {/* MODAL */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editUser}
      />
    </div>
  );
}