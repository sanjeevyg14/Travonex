// Load environment variables before Firebase initialization
import 'dotenv/config';
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
  // Construct service account credentials from env vars
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  // Debug: ensure project_id is present

  const firebaseConfig = {
    credential: cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  };
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
  firebaseDB = getFirestore(firebaseApp);
}

export { firebaseApp, firebaseAuth, firebaseStorage, firebaseDB };
