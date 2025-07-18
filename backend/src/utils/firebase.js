// Firebase Admin SDK setup
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

let firebaseApp;
let firebaseAuth;
let firebaseStorage;
let firebaseDB;

if (process.env.NODE_ENV !== 'test') {
  const firebaseConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  };
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
  firebaseDB = getFirestore(firebaseApp);
}

export { firebaseApp, firebaseAuth, firebaseStorage, firebaseDB };
