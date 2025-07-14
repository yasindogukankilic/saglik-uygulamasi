import { Users, FileText, BarChart3, Activity } from 'lucide-react';

// Navigation menu items
export const MENU_ITEMS = [
  { 
    id: 'sessions', 
    label: 'Seans Yönetimi', 
    icon: Activity 
  },
  { 
    id: 'content', 
    label: 'İçerik Yönetimi', 
    icon: FileText 
  },
  { 
    id: 'users', 
    label: 'Kullanıcı Yönetimi', 
    icon: Users 
  }
];

// Filter options for different pages
export const FILTER_OPTIONS = {
  contentStatus: [
    { label: 'Tüm Durumlar', value: 'all' },
    { label: 'Yayınlanan', value: 'published' },
    { label: 'Taslak', value: 'draft' },
    { label: 'Arşiv', value: 'archived' }
  ],
  userStatus: [
    { label: 'Tüm Durumlar', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Pasif', value: 'inactive' },
    { label: 'Askıda', value: 'suspended' }
  ],
};