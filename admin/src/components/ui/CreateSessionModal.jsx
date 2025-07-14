import React, { useEffect, useState } from 'react';
import { Copy, QrCode, Link, CheckCircle } from 'lucide-react';
import Modal  from './Modal';
import Input  from './Input';
import Button from './Button';
import Card   from './Card';

import { db } from '../../firebase';
import {
  addDoc, collection, serverTimestamp,
  doc, onSnapshot
} from 'firebase/firestore';

const durationOpts = [
  { value: '1-day',    label: '1 Gün' },
  { value: '1-week',   label: '1 Hafta' },
  { value: '1-month',  label: '1 Ay' },
  { value: 'unlimited',label: 'Sınırsız' }
];

const CreateSessionModal = ({ isOpen, onClose, contents = [], onCreated }) => {
  /* adım 1 = form, adım 2 = başarı */
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', duration: '1-day', contentId: '' });
  const [created, setCreated] = useState(null);   // firestore snapshot
  const [saving,  setSaving]  = useState(false);  // submit butonu

  /* reset */
  const reset = () => {
    setStep(1);
    setForm({ name: '', duration: '1-day', contentId: '' });
    setCreated(null);
    setSaving(false);
  };

  /* ------ form change ------ */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ------ submit ------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contentId) return alert('Tüm alanları doldurun!');
    setSaving(true);

    /* 1. Firestore yaz */
    const sel = contents.find(c => c.id.toString() === form.contentId);
    const ref = await addDoc(collection(db, 'sessions'), {
      sessionName  : form.name,
      duration     : form.duration,
      contentId    : form.contentId,
      contentName  : sel?.name || '',
      questionCount: sel?.questionCount || 0,
      date         : new Date().toISOString().slice(0,10),
      studentCount : 0,
      accuracyRate : 0,
      status       : 'active',
      createdAt    : serverTimestamp()
    });

    /* 2. Belgeyi dinle → inviteLink + qrCodeURL Functions tarafından eklenecek */
    const unsub = onSnapshot(doc(db, 'sessions', ref.id), (snap) => {
      const data = snap.data();
      if (data.inviteLink && data.qrCodeURL) {
        setCreated({ id: snap.id, ...data });
        setStep(2);
        setSaving(false);
        unsub();                     // dinlemeyi bitir
        onCreated?.({ id: snap.id, ...data });
      }
    });
  };

  const copy = (t) => navigator.clipboard.writeText(t);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose(); }}
      title={step === 1 ? 'Yeni Seans Oluştur' : 'Seans Başarıyla Oluşturuldu'}
      size={step === 1 ? 'md' : 'lg'}
    >
      {step === 1 ? (
        /* ---------- Form ---------- */
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Seans Adı"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Örn. Anatomi - Grup A"
            required
          />
          <Input.Select
            label="Seans Süresi"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            options={[{ value:'', label:'Süre seçin' }, ...durationOpts]}
            required
          />
          <Input.Select
            label="İçerik Seçimi"
            name="contentId"
            value={form.contentId}
            onChange={handleChange}
            options={[
              { value:'', label:'İçerik seçin' },
              ...contents.map(c => ({
                value: c.id.toString(),
                label: `${c.name} (${c.questionCount} soru)`
              }))
            ]}
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary"
                    className="flex-1" onClick={() => { reset(); onClose(); }}>
              İptal
            </Button>
            <Button type="submit" variant="primary"
                    className="flex-1" disabled={saving}>
              {saving ? 'Oluşturuluyor…' : 'Seans Oluştur'}
            </Button>
          </div>
        </form>
      ) : (
        /* ---------- Başarı ---------- */
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                            justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Seans Başarıyla Oluşturuldu!
            </h3>
            <p className="text-gray-600">
              Öğrenciler bağlantı veya QR kod ile katılabilir.
            </p>
          </div>

          {/* Bilgiler */}
          <Card><Card.Content>
            <div className="space-y-2 text-sm">
              {[
                ['Seans Adı', created.sessionName],
                ['İçerik',    created.contentName],
                ['Süre',      durationOpts.find(d=>d.value===created.duration)?.label],
                ['Oluşturulma', new Date().toLocaleString('tr-TR')]
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between">
                  <span className="text-gray-600">{k}:</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Card.Content></Card>

          {/* Link */}
          <Card><Card.Content>
            <h4 className="font-semibold flex items-center mb-3">
              <Link className="w-4 h-4 mr-2"/> Davet Bağlantısı
            </h4>
            <div className="flex items-center space-x-2">
              <input readOnly className="flex-1 px-3 py-2 border border-gray-300
                                         rounded-lg bg-gray-50 text-sm"
                     value={created.inviteLink} />
              <Button variant="secondary" size="sm" icon={Copy}
                      onClick={()=>copy(created.inviteLink)}>Kopyala</Button>
            </div>
          </Card.Content></Card>

          {/* QR */}
          <Card><Card.Content>
            <h4 className="font-semibold flex items-center mb-3">
              <QrCode className="w-4 h-4 mr-2"/> QR Kod
            </h4>
            <div className="text-center">
              <img src={created.qrCodeURL} alt="QR"
                   className="mx-auto border border-gray-200 rounded-lg"/>
              <p className="text-sm text-gray-600 mt-2">
                Öğrenciler bu kodu okutarak katılabilir
              </p>
            </div>
          </Card.Content></Card>

          <div className="flex space-x-3">
            <Button variant="secondary" className="flex-1"
                    onClick={() => { reset(); onClose(); }}>
              Kapat
            </Button>
            <Button variant="primary" icon={Copy} className="flex-1"
                    onClick={()=>copy(created.inviteLink)}>
              Bağlantıyı Kopyala
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateSessionModal;
