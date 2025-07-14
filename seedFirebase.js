/**
 *  Firebase seed –  HealthAdmin demo
 *  Komut:  node seedFirebase.js
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }            from 'firebase-admin/auth';
import { getFirestore }       from 'firebase-admin/firestore';
import fs from 'fs';

// 1) Service account ile bağlan
const serviceAccount = JSON.parse(
  fs.readFileSync('./saglik-uygulamasi-251f7-firebase-adminsdk-fbsvc-2a19e4940b.json', 'utf8')
);
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db   = getFirestore();

async function seed() {
  /* ---------- 1. Admin kullanıcı ---------- */
  const email    = 'admin@healthadmin.com';
  const password = 'admin123';
  let adminUser;

  try {
    adminUser = await auth.getUserByEmail(email);
    console.log('Auth: mevcut admin bulundu →', adminUser.uid);
  } catch {
    adminUser = await auth.createUser({
      email,
      password,
      displayName: 'Admin User',
      emailVerified: true,
    });
    console.log('Auth: yeni admin oluşturuldu →', adminUser.uid);
  }

  // Firestore'da users/{uid}
  await db.collection('users').doc(adminUser.uid).set({
    name      : 'Admin User',
    email,
    role      : 'admin',
    createdAt : new Date(),
  }, { merge: true });

  /* ---------- 2. Contents koleksiyonu ---------- */
  const contents = [
    { id: 'anatomy-1',  name: 'Anatomi Test 1', questionCount: 15 },
    { id: 'physiology', name: 'Fizyoloji Quiz',  questionCount: 20 },
    { id: 'cardio',     name: 'Kardiyoloji Testi', questionCount: 12 },
  ];
  for (const c of contents) {
    await db.collection('contents').doc(c.id).set(c);
  }
  console.log('Firestore: contents yüklendi');

  /* ---------- 3. Sessions koleksiyonu ---------- */
  const sessions = [
    {
      sessionName : 'Seans-1',
      date        : '2024-07-10',
      contentId   : 'anatomy-1',
      studentCount: 25,
      accuracyRate: 78,
      students: [
        { name: 'Ahmet Yılmaz',  email: 'ahmet@email.com',  correctCount: 16, wrongCount: 4, score: 80 },
        { name: 'Ayşe Kara',     email: 'ayse@email.com',   correctCount: 18, wrongCount: 2, score: 90 },
        { name: 'Mehmet Demir',  email: 'mehmet@email.com', correctCount: 14, wrongCount: 6, score: 70 },
      ],
    },
    {
      sessionName : 'Seans-2',
      date        : '2024-07-12',
      contentId   : 'physiology',
      studentCount: 23,
      accuracyRate: 85,
      students: [
        { name: 'Fatma Özkan', email: 'fatma@email.com', correctCount: 17, wrongCount: 3, score: 85 },
        { name: 'Ali Veli',    email: 'ali@email.com',   correctCount: 19, wrongCount: 1, score: 95 },
      ],
    },
  ];

  for (const s of sessions) {
    // Firestore otomatik ID → inviteLink/qrCode hesaplayabilmen için ID’ye ihtiyacın varsa `add()` sonucundan alabilirsin
    const ref = await db.collection('sessions').add({
      ...s,
      status     : 'active',
      createdAt  : new Date(),
    });
    console.log(`Firestore: session “${s.sessionName}” →`, ref.id);
  }

  console.log('\n✅ Seed tamamlandı. Şimdi LoginPage’de\n   admin@healthadmin.com / admin123 ile giriş yapabilirsin.');
}

seed().then(() => process.exit()).catch((err) => {
  console.error(err);
  process.exit(1);
});
