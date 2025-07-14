/**
 *  Firebase seed – Sadece ADMIN kullanıcısı
 *  --------------------------------------------
 *  Komut:   node seedUser.js
 */

import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }            from 'firebase-admin/auth';
import { getFirestore }       from 'firebase-admin/firestore';

/*─────────────────────────────*/
/* 1) Firebase Admin başlat    */
/*─────────────────────────────*/
const serviceAccount = JSON.parse(
  fs.readFileSync('./saglik-uygulamasi-251f7-firebase-adminsdk-fbsvc-2a19e4940b.json', 'utf8')   // anahtar dosya adını gerekirse değiştirin
);
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db   = getFirestore();

/*─────────────────────────────*/
/* 2) Admin hesabı tanımı      */
/*─────────────────────────────*/
const ADMIN = {
  email       : 'admin@healthadmin.com',
  password    : 'admin123',
  displayName : 'Admin User',
  claims      : { admin: true },      // custom-claim
  profileDoc  : {
    firstName : 'Admin',
    lastName  : 'User',
    role      : 'admin',
  }
};

/*─────────────────────────────*/
/* 3)  İşlemi çalıştır          */
/*─────────────────────────────*/
async function seed() {
  let userRec;

  /* 3.1  Auth tarafı */
  try {
    userRec = await auth.getUserByEmail(ADMIN.email);
    console.log('🔹  Auth: Mevcut →', ADMIN.email);
  } catch {
    userRec = await auth.createUser({
      email        : ADMIN.email,
      password     : ADMIN.password,
      displayName  : ADMIN.displayName,
      emailVerified: true,
    });
    console.log('✅  Auth: Oluşturuldu →', ADMIN.email);
  }

  /* 3.2  Admin claim’i */
  await auth.setCustomUserClaims(userRec.uid, ADMIN.claims);
  console.log('   🔑  Admin claim atandı');

  /* 3.3  Firestore profil belgesi */
  await db.collection('users').doc(userRec.uid).set(
    {
      uid       : userRec.uid,
      email     : ADMIN.email,
      ...ADMIN.profileDoc,
      createdAt : new Date(),
    },
    { merge: true }
  );
  console.log('   📄  Firestore kaydedildi');

  console.log('\n🎉  Seed tamamlandı.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('🚨  Hata:', err);
  process.exit(1);
});
