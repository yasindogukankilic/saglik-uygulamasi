/**
 * Firebase Cloud Functions – admin kullanıcı işlemleri & QR kod
 * -------------------------------------------------------------
 * node > v18,  "firebase-functions": "^4"  (v2 API)
 */

const admin               = require('firebase-admin');
const { logger, https }   = require('firebase-functions');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const QRCode              = require('qrcode');
const { v4: uuid }        = require('uuid');

admin.initializeApp();

const db     = admin.firestore();
const bucket = admin.storage().bucket();     // default Storage bucket

/* ──────────────────────────────────────────────────────────────── */
/* 1) Otomatik davet linki + QR kod                                */
/*    Firestore yolunuz farklıysa  ➜  'sessions/{sessionId}'       */
/* ──────────────────────────────────────────────────────────────── */
exports.generateSessionQR = onDocumentCreated('sessions/{sessionId}', async (event) => {
  const sessionId = event.params.sessionId;
  const inviteLink = `https://saglik-uygulamasi.vercel.app/join/${sessionId}`; 

  try {
    /* QR PNG’si oluştur */
    const pngBuffer = await QRCode.toBuffer(inviteLink, {
      type: 'png',
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    /* Storage’a yükle */
    const filePath = `session-qr/${sessionId}.png`;
    const file     = bucket.file(filePath);

    await file.save(pngBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: { firebaseStorageDownloadTokens: uuid() }, // herkese açık link
      },
    });

    const qrURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    /* Firestore belgesini güncelle */
    await db.doc(`sessions/${sessionId}`).update({
      inviteLink,
      qrCodeURL: qrURL,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`✅ QR kod üretildi → sessions/${sessionId}`);
  } catch (err) {
    logger.error('❌ QR kod üretim hatası', err);
    throw err;
  }
});

/* ──────────────────────────────────────────────────────────────── */
/* 2) createAuthUser – Admin claim’li auth hesabı aç               */
/*    httpsCallable('createAuthUser')                              */
/* ──────────────────────────────────────────────────────────────── */
exports.createAuthUser = https.onCall(async (data, context) => {
  if (!context.auth?.token?.admin) {
    throw new https.HttpsError('permission-denied', 'Bu işlemi yapmak için yönetici olmalısınız.');
  }

  const { email, password, displayName } = data || {};
  if (!email || !password) {
    throw new https.HttpsError('invalid-argument', 'E-posta ve şifre zorunludur.');
  }

  try {
    const userRec = await admin.auth().createUser({ email, password, displayName });
    await admin.auth().setCustomUserClaims(userRec.uid, { admin: true });
    logger.info(`👤 Yeni admin oluşturuldu → uid=${userRec.uid}`);
    return { uid: userRec.uid };
  } catch (err) {
    logger.error('Auth kullanıcı oluşturma hatası', err);
    throw new https.HttpsError('internal', err.message);
  }
});

/* ──────────────────────────────────────────────────────────────── */
/* 3) deleteAuthUser – Auth hesabını sil                           */
/*    httpsCallable('deleteAuthUser')                              */
/* ──────────────────────────────────────────────────────────────── */
exports.deleteAuthUser = https.onCall(async (data, context) => {
  if (!context.auth?.token?.admin) {
    throw new https.HttpsError('permission-denied', 'Bu işlemi yapmak için yönetici olmalısınız.');
  }

  const { uid } = data || {};
  if (!uid) throw new https.HttpsError('invalid-argument', 'uid eksik');

  try {
    await admin.auth().deleteUser(uid);
    logger.info(`🗑️  Auth hesabı silindi → uid=${uid}`);
    return { ok: true };
  } catch (err) {
    logger.error('Auth kullanıcı silme hatası', err);
    throw new https.HttpsError('internal', err.message);
  }
});
