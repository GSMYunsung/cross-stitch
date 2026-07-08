import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}",
);

const adminApp =
  getApps().find((a) => a.name === "admin") ??
  initializeApp(
    {
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    "admin",
  );

export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
