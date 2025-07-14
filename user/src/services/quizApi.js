import {
  collection, doc, getDocs, orderBy, query,
  setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/* ▸ Soruları çek — alt koleksiyondan */
export async function fetchQuestions(contentId) {
  const qSnap = await getDocs(
    query(collection(db, 'contents', contentId, 'questions'), orderBy('createdAt'))
  );
  return qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ▸ Sonucu kaydet — aynı içerik dokümanının altına */
export async function saveResult(contentId, user, result) {
  const rRef = doc(db, 'contents', contentId, 'results', user.email);
  return setDoc(
    rRef,
    {
      ...result,
      email   : user.email,
      first   : user.first,
      last    : user.last,
      takenAt : serverTimestamp()
    },
    { merge: true }
  );
}
