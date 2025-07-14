import React, { useEffect, useState } from 'react';
import { Image, Film, Play, CheckCircle } from 'lucide-react';
import {
  collection, getDocs, orderBy, query
} from 'firebase/firestore';
import { db } from '../../firebase';

import Modal from './Modal';
import Card  from './Card';

/* ———————————————————————————————————————————————— */
/* Yardımcı küçük bileşenler ------------------------------------------------ */

const Info = ({ label, value }) => (
  <div>
    <span className="text-gray-600">{label}:</span>
    <p className="font-medium">{value}</p>
  </div>
);

const SummaryBox = ({ color, count, label }) => (
  <div className={`text-center p-3 bg-${color}-50 rounded-lg`}>
    <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
    <p className={`text-${color}-700`}>{label}</p>
  </div>
);

/* ———————————————————————————————————————————————— */
/* Ana Modal ---------------------------------------------------------------- */

export default function ContentViewModal({ isOpen, onClose, contentData }) {
  /* ---------- State ---------------------------------------------------- */
  const [questions, setQuestions] = useState(null);   // null = yükleniyor

  /* ---------- Alt-koleksiyondan soruları çek --------------------------- */
  useEffect(() => {
    if (!isOpen || !contentData) return;              // guard burada

    const fetchQs = async () => {
      try {
        const col  = collection(db, 'contents', contentData.id, 'questions');
        const snap = await getDocs(query(col, orderBy('createdAt')));
        setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setQuestions([]);                             // hata → “soru yok”
      }
    };
    fetchQs();
  }, [isOpen, contentData?.id]);                      // hook sırası değişmez

  /* ---------- contentData yoksa ------------------------------------------------ */
  if (!contentData) return null;                      // hook’lardan SONRA

  /* ---------- Yardımcılar ------------------------------------------------------ */
  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':     return <Image className="w-4 h-4 text-blue-600" />;
      case 'video':     return <Film  className="w-4 h-4 text-red-600"  />;
      case 'animation': return <Play  className="w-4 h-4 text-green-600"/>;
      default:          return null;
    }
  };
  const getOptionLabel = (i) => String.fromCharCode(65 + i); // A, B, C…

  const createdDate = contentData.createdAt
    ? (contentData.createdAt.toDate
        ? contentData.createdAt.toDate()
        : new Date(contentData.createdAt)
      ).toLocaleDateString('tr-TR', { year:'numeric', month:'2-digit', day:'2-digit' })
    : 'Belirtilmemiş';

  /* ---------- Render ----------------------------------------------------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${contentData.name} – İçerik Görüntüleme`}
      size="xl"
    >
      {/* ÜST BİLGİ ------------------------------------------------------------- */}
      <Card><Card.Content>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="İçerik Adı"  value={contentData.name} />
          <Info label="Soru Sayısı" value={questions?.length ?? '—'} />
          <Info label="Oluşturulma" value={createdDate} />
          <Info label="Oluşturan"   value={contentData.creator || 'Admin'} />
        </div>
      </Card.Content></Card>

      {/* YÜKLENİYOR ------------------------------------------------------------ */}
      {questions === null && (
        <div className="py-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500 mx-auto mb-4" />
          Sorular yükleniyor…
        </div>
      )}

      {/* SORULAR --------------------------------------------------------------- */}
      {Array.isArray(questions) && questions.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto my-6">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <Card.Content>
                <div className="space-y-4">
                  {/* Soru Başlığı */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Soru {idx + 1}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line">
                        {q.question}
                      </p>
                    </div>
                    {q.mediaURL && (
                      <div className="ml-4 flex items-center space-x-1">
                        {getMediaIcon(q.mediaType)}
                        <span className="text-xs text-gray-500 capitalize">
                          {q.mediaType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Görsel Ön-izleme */}
                  {q.mediaURL && q.mediaType === 'image' && (
                    <img
                      src={q.mediaURL}
                      alt="Soru görseli"
                      className="max-w-full h-40 object-contain rounded-lg border border-gray-200"
                    />
                  )}

                  {/* Seçenekler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options?.map((opt, i) => (
                      <div
                        key={i}
                        className={`
                          p-3 rounded-lg border
                          ${i === q.correctAnswer
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50  border-gray-200 text-gray-700'}
                        `}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`
                              inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full
                              ${i === q.correctAnswer
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'}
                            `}
                          >
                            {getOptionLabel(i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {i === q.correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* BOŞ DURUM ------------------------------------------------------------- */}
      {Array.isArray(questions) && questions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Bu içerikte henüz soru bulunmuyor.
        </div>
      )}

      {/* ÖZET KUTULARI --------------------------------------------------------- */}
      {Array.isArray(questions) && questions.length > 0 && (
        <Card><Card.Content>
          <h4 className="font-semibold text-gray-800 mb-3">Özet</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <SummaryBox color="blue"   count={questions.length}                               label="Toplam Soru" />
            <SummaryBox color="green"  count={questions.filter(q => q.mediaURL).length}       label="Medyalı Soru" />
            <SummaryBox color="purple" count={questions.filter(q => q.mediaType === 'image').length}  label="Görsel" />
            <SummaryBox color="orange" count={questions.filter(q => q.mediaType === 'video').length}  label="Video" />
          </div>
        </Card.Content></Card>
      )}
    </Modal>
  );
}
