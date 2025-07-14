import React, { useEffect, useState } from 'react';
import Modal            from './Modal';
import Input            from './Input';
import Button           from './Button';
import Card             from './Card';
import QuestionList     from './QuestionList';
import GlobalMediaModal from './GlobalMediaModal';

import { db, storage, auth } from '../../firebase';
import {
  collection, doc, setDoc, serverTimestamp,
  writeBatch, deleteDoc, getDocs
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';

/* ---------- yardımcı util'ler ---------- */
const uploadFile = async (file, contentId) => {
  const fileRef = ref(
    storage,
    `content-media/${contentId}/${Date.now()}_${file.name}`
  );
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export default function ContentFormModal({ isOpen, onClose, editData = null }) {
  const isEdit = Boolean(editData);

  /* ---------- state ---------- */
  const [content,   setContent] = useState({ name: '' });
  const [questions, setQ]       = useState([]);
  const [globalOpen,setGOpen]   = useState(false);
  const [saving,    setSaving]  = useState(false);

  /* ---------- modal açıldığında ---------- */
  useEffect(() => {
    if (!isOpen) return;

    setContent(isEdit ? { name: editData.name } : { name: '' });

    setQ(isEdit
      ? (editData.questions || []).map(q => ({ ...q, media: q.mediaURL || null }))
      : [{
          id: 1,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          media: null,
          mediaType: null
        }]
    );
  }, [isOpen, isEdit, editData]);

  const updateQ = fn => setQ(prev => fn(prev));

  /* ---------- Kaydet ---------- */
  const handleSubmit = async e => {
    e.preventDefault();
    if (saving) return;

    if (!content.name.trim())                    return alert('İçerik adı zorunlu');
    if (questions.some(q =>
      !q.question.trim() || q.options.some(o => !o.trim())
    )) return alert('Tüm sorular doldurulmalı');

    setSaving(true);
    const batch = writeBatch(db);

    try {
      /* 1 ▪️ İçerik dokümanı */
      const docRef = isEdit
        ? doc(db, 'contents', editData.id)
        : doc(collection(db, 'contents'));

      const contentId = docRef.id;
      const meta = {
        name: content.name,
        questionCount: questions.length,
        updatedAt: serverTimestamp(),
        creator: auth.currentUser?.email || 'unknown@local',
        ...(isEdit ? {} : { createdAt: serverTimestamp() })
      };
      batch.set(docRef, meta, { merge: true });

      /* 2 ▪️ Sorular (alt koleksiyon) */
      // –– Önce eski soruları sil (edit ise)
      if (isEdit) {
        const oldQsSnap = await getDocs(collection(docRef, 'questions'));
        oldQsSnap.forEach(d => batch.delete(d.ref));
      }

      // –– Sonra güncel soruları ekle
      for (const q of questions) {
        let mediaURL = q.mediaURL || null;
        if (q._file) {
          if (q.mediaURL?.startsWith('https://')) {
            try { await deleteObject(ref(storage, q.mediaURL)); } catch {/* ignore */}
          }
          mediaURL = await uploadFile(q._file, contentId);
        }

        const { _file, ...rest } = q;
        const qRef = doc(collection(docRef, 'questions'));
        batch.set(qRef, {
          ...rest,
          mediaURL,
          mediaType: q.mediaType || _file?.type || null,
          createdAt: serverTimestamp()
        });
      }

      /* 3 ▪️ Batch'i gönder */
      await batch.commit();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'İçeriği Düzenle' : 'Yeni İçerik Oluştur'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <Card><Card.Content>
          <Input
            label="İçerik Adı"
            value={content.name}
            onChange={e => setContent({ ...content, name: e.target.value })}
            required
          />
        </Card.Content></Card>

        <Card><Card.Content>
          <div className="flex justify-between mb-4">
            <h4 className="text-lg font-semibold">
              Sorular ({questions.length}/20)
            </h4>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={() => setGOpen(true)}>
                Tüm Sorulara Medya
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={questions.length >= 20}
                onClick={() => updateQ(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    media: null,
                    mediaType: null
                  }
                ])}
              >
                Soru Ekle
              </Button>
            </div>
          </div>

          <QuestionList questions={questions} onChange={updateQ} />
        </Card.Content></Card>

        <div className="flex space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="flex-1"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor…'
                    : isEdit ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>

      {/* toplu medya ekleme modalı */}
      {globalOpen && (
        <GlobalMediaModal
          onApply={(file, type) => {
            const url = URL.createObjectURL(file);
            updateQ(prev => prev.map(q => ({
              ...q,
              _file: file,
              mediaURL: url,
              media: url,
              mediaType: type
            })));
            setGOpen(false);
          }}
          onClose={() => setGOpen(false)}
        />
      )}
    </Modal>
  );
}
