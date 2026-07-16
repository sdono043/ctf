import { upsertParticipant, upsertSolve } from "./firebase.js";
import { loadProgress } from "./storage.js";

const ID_KEY = "ctf_participant_id";
const NAME_KEY = "ctf_participant_name";

export function getParticipant() {
  const id = localStorage.getItem(ID_KEY);
  const name = localStorage.getItem(NAME_KEY);
  return id && name ? { id, name } : null;
}

export async function signIn(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  localStorage.setItem(NAME_KEY, trimmed);
  await upsertParticipant(id, trimmed);

  // Backfill anything solved locally before this device signed in, so
  // joining the leaderboard mid-run doesn't lose earlier progress.
  const progress = loadProgress();
  const backfills = Object.entries(progress.challenges)
    .filter(([, state]) => state.solved)
    .map(([challengeId, state]) => upsertSolve(id, challengeId, state.hintsUsed || 0));
  await Promise.all(backfills);

  return { id, name: trimmed };
}
