// src/utils/exportSessionExcel.js
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { utils, writeFile } from 'xlsx';
import { db } from '../firebase';

/**
 * Seansa ait öğrenci sonuçlarını Excel (.xlsx) dosyası olarak indirir.
 * @param {Object} session Firestore'dan gelen seans nesnesi (id, sessionName, date vb.)
 */
export const exportSessionExcel = async (session) => {
  try {
    // 1) Öğrenci verilerini al
    const q = query(
      collection(db, `sessions/${session.id}/students`),
      orderBy('joinedAt', 'asc')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      alert('Bu seansa ait öğrenci verisi yok.');
      return;
    }

    // 2) Satırları hazırlayalım
    const rows = snap.docs.map((d) => {
      const s = d.data();
      return {
        'Ad'      : s.firstName,
        'Soyad'   : s.lastName,
        'E-posta' : s.email,
        'Doğru'   : s.correctCount ?? 0,
        'Yanlış'  : s.wrongCount  ?? 0,
        'Puan'    : s.score       ?? 0,
      };
    });

    // 3) Çalışma kitabı / sayfa
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sonuçlar');

    // 4) Dosya adını güvenli hâle getir
    const safeName = session.sessionName.replace(/\s+/g, '_');
    const fileName = `${safeName}_${session.date}.xlsx`;

    // 5) Kaydet
    writeFile(wb, fileName, { bookType: 'xlsx' });
  } catch (err) {
    console.error(err);
    alert('Excel oluşturulurken bir hata oluştu.');
  }
};
