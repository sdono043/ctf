import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Public web config — Firebase web API keys are meant to be exposed
// client-side; access control is enforced by Firestore security rules
// (see firebase/firestore.rules), not by hiding this key.
const firebaseConfig = {
  projectId: "ctf-leaderboard-2026",
  appId: "1:1047355715270:web:a4ef9d205a059dd2b8b1c7",
  storageBucket: "ctf-leaderboard-2026.firebasestorage.app",
  apiKey: "AIzaSyByuVtsuXKZQrqI01ujvUmFhPedEMb8Ai8",
  authDomain: "ctf-leaderboard-2026.firebaseapp.com",
  messagingSenderId: "1047355715270",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function upsertParticipant(participantId, name) {
  await setDoc(doc(db, "participants", participantId), { name, updatedAt: serverTimestamp() }, { merge: true });
}

export async function upsertSolve(participantId, challengeId, hintsUsed) {
  const solveId = `${participantId}_${challengeId}`;
  await setDoc(
    doc(db, "solves", solveId),
    { participantId, challengeId, hintsUsed, solvedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function fetchAllParticipants() {
  const snap = await getDocs(collection(db, "participants"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllSolves() {
  const snap = await getDocs(collection(db, "solves"));
  return snap.docs.map((d) => d.data());
}
