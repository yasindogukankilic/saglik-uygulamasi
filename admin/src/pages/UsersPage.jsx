import React, { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader    from '../components/ui/PageHeader';
import StatCard      from '../components/ui/StatCard';
import SearchBar     from '../components/ui/SearchBar';
import Table         from '../components/ui/Table';
import UserFormModal from '../components/ui/UserFormModal';
import Button        from '../components/ui/Button';
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

    const now = new Date();
    const thisMonth = users.filter((u) => {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, active: total, thisMonth };
  }, [users]);

  /* ---- filtre ---- */
  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`   // 🆕 template-literal
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

  /* ---- UI ---- */
  return (
    <div className="space-y-6">
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
            onClick={() => { setEditUser(null); setModalOpen(true); }}
          >
            Yeni Admin
          </Button>,
        ]}
      />

      {/* KARTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Admin"
          value={stats.total.toString()}
          change={`+${stats.thisMonth} bu ay`}
          icon={Users}
          iconBgColor={iconBgs.blue}
          iconColor={iconColors.primary}
        />
        <StatCard
          title="Aktif Admin"
          value={stats.active.toString()}
          change="Tümü aktif"
          icon={Users}
          iconBgColor={iconBgs.green}
          iconColor={iconColors.success}
        />
        <StatCard
          title="Bu Ay Eklenen"
          value={stats.thisMonth.toString()}
          change="Yeni kayıt"
          icon={Plus}
          iconBgColor={iconBgs.purple}
          iconColor={iconColors.purple}
        />
      </div>

      {/* ARAMA */}
      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Admin ara..."
        showFilterButton={false}
      />

      {/* TABLO */}
      <Table
        columns={columns}
        data={filtered}
        rowActions={(row) => [
          { label:'Düzenle', icon: Edit,   onClick: () => handleEdit(row) },
          { label:'Sil',     icon: Trash2, danger:true, onClick: () => handleDelete(row) },
        ]}
      />

      {/* MODAL */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editUser}
      />
    </div>
  );
}
