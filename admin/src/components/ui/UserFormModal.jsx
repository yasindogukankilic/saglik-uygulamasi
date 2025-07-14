/* components/ui/UserFormModal.jsx
   ---------------------------------------------------------------
   Yeni admin kullanıcı ekleme / var olanı düzenleme modalı
   --------------------------------------------------------------- */

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import Modal  from './Modal';
import Input  from './Input';
import Button from './Button';
import { generateSecurePassword } from '../../utils/passwordUtils';

import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../firebase';
import {
  addDoc,
  updateDoc,
  serverTimestamp,
  collection,
  doc,
} from 'firebase/firestore';

/* Ünvan seçenekleri ------------------------------------------------*/
const TITLE_OPTS = [
  { value: '', label: 'Ünvan Seçin' },
  { value: 'arş-gör', label: 'Arş. Gör.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'doç-dr', label: 'Doç. Dr.' },
  { value: 'prof-dr', label: 'Prof. Dr.' },
  { value: 'uzm-dr', label: 'Uzm. Dr.' },
  { value: 'hemşire', label: 'Hemşire' },
  { value: 'teknisyen', label: 'Teknisyen' },
];

/* ------------------------------------------------------------------*/
export default function UserFormModal({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData);

  /* ---------- State ----------------------------------------------*/
  const [form, setForm] = useState({
    firstName: '',
    lastName : '',
    title    : '',
    email    : '',
    password : '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ---------- Open / Reset ---------------------------------------*/
  useEffect(() => {
    setForm(
      initialData
        ? { ...initialData, password: '' } // şifre gösterilmez
        : { firstName:'', lastName:'', title:'', email:'', password:'' }
    );
    setErrors({});
  }, [initialData, isOpen]);

  /* ---------- Helpers --------------------------------------------*/
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const genPass = () =>
    setForm((p) => ({ ...p, password: generateSecurePassword(12) }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'İsim zorunlu';
    if (!form.lastName.trim())  e.lastName  = 'Soyisim zorunlu';
    if (!form.title)            e.title     = 'Ünvan seçin';

    if (!form.email.trim())     e.email     = 'E-posta zorunlu';
    else if (!/\S+@\S+\.\S+/.test(form.email))
                                e.email     = 'E-posta geçersiz';

    if (!isEdit && !form.password) e.password = 'Şifre zorunlu';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- Submit ---------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        /* Firestore güncelle */
        await updateDoc(doc(db, 'users', initialData.id), {
          firstName : form.firstName,
          lastName  : form.lastName,
          title     : form.title,
          email     : form.email,
          updatedAt : serverTimestamp(),
        });
      } else {
        /* 1) Token’ı tazele → admin claim fonksiyona gitsin */
        await auth.currentUser.getIdToken(true);

        /* 2) Callable fonksiyonu tetikle */
        const createAuthUser = httpsCallable(functions, 'createAuthUser');
        const { data } = await createAuthUser({
          email       : form.email,
          password    : form.password,
          displayName : `${form.firstName} ${form.lastName}`,
        });
        const uid = data.uid;

        /* 3) Firestore kaydı */
        await addDoc(collection(db, 'users'), {
          uid,
          firstName : form.firstName,
          lastName  : form.lastName,
          title     : form.title,
          email     : form.email,
          role      : 'admin',
          createdAt : serverTimestamp(),
        });
      }

      onClose();     // Başarılı
    } catch (err) {
      alert('Kayıt hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI -------------------------------------------------*/
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Kullanıcıyı Düzenle' : 'Yeni Admin Oluştur'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Ad Soyad */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="İsim"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Soyisim"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        {/* Ünvan */}
        <Input.Select
          label="Ünvan"
          name="title"
          value={form.title}
          onChange={handleChange}
          options={TITLE_OPTS}
          error={errors.title}
          required
        />

        {/* E-posta */}
        <Input
          label="E-posta Adresi"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        {/* Şifre (yalnızca yeni kayıt) */}
        {!isEdit && (
          <div className="space-y-2">
            <Input
              label="Geçici Şifre"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={genPass}
              className="w-full"
            >
              Güvenli Şifre Oluştur
            </Button>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={saving}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
