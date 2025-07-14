// src/components/ui/SessionDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { QrCode, Copy, Download } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

import Modal  from './Modal';
import Button from './Button';
import { exportSessionExcel } from '../../utils/exportSessionExcel';

const copyText = (t) => navigator.clipboard.writeText(t);

const SessionDetailModal = ({ isOpen, onClose, sessionData }) => {
  const [qrOpen, setQrOpen]     = useState(false);
  const [students, setStudents] = useState([]);

  /* ---------- her zaman tanımlı değişkenler ---------- */
  const sessionId  = sessionData?.id;
  const inviteLink = sessionData?.inviteLink  ?? '';
  const qrUrl      = sessionData?.qrCodeURL  ?? sessionData?.qrCode ?? '';

  /* 🔴 Hook koşulsuz: sessionId yoksa dinleme kurulmaz */
  useEffect(() => {
    if (!sessionId || !isOpen) {
      setStudents([]);
      return () => {};
    }

    const q = query(
      collection(db, `sessions/${sessionId}/students`),
      orderBy('joinedAt', 'asc')
    );
    const unsub = onSnapshot(q, snap =>
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [sessionId, isOpen]);

  /* session veri henüz gelmediyse modal açma */
  if (!sessionData) return null;

  const cellClass = (ok) =>
    ok ? 'bg-green-100 text-green-800 border-green-200'
       : 'bg-red-100 text-red-800 border-red-200';

  return (
    <>
      {/* Ana modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${sessionData.sessionName} – Detaylı Sonuçlar`}
        size="xl"
      >
        {/* Başlık & Aksiyon düğmeleri */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Seans Bilgileri</h4>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => exportSessionExcel(sessionData)}
            >
              Excel İndir
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={QrCode}
              onClick={() => setQrOpen(true)}
              disabled={!qrUrl}
            >
              {qrUrl ? 'QR Kod & Davet' : 'QR Hazırlanıyor'}
            </Button>
          </div>
        </div>

        {/* Öğrenci tablosu veya boş mesaj */}
        {students.length === 0 ? (
          <p className="text-center py-12 text-gray-500">
            Bu seansta henüz öğrenci bulunmuyor
          </p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Öğrenci
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doğru
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yanlış
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puan
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-posta
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-green-600 font-semibold">
                        {s.correctCount ?? 0}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-red-600 font-semibold">
                        {s.wrongCount ?? 0}
                      </td>
                      <td className="px-2 py-3 text-center text-sm font-bold">
                        {s.score ?? 0}
                      </td>
                      <td className="px-2 py-3 text-center text-xs text-gray-600">
                        {s.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* QR modal */}
      <Modal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Seansa Katılım Bağlantısı"
        size="sm"
      >
        <div className="space-y-6 text-center">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR Kod"
              className="mx-auto border border-gray-200 rounded-lg"
            />
          ) : (
            <p className="py-8 text-gray-500">QR kodu hazırlanıyor…</p>
          )}

          <p className="text-sm text-gray-600 break-all">{inviteLink}</p>

          <Button
            variant="secondary"
            icon={Copy}
            onClick={() => copyText(inviteLink)}
            disabled={!inviteLink}
          >
            Bağlantıyı Kopyala
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SessionDetailModal;
