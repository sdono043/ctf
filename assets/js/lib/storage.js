// Namespaced, schema-versioned localStorage wrapper. All progress lives only
// in this browser — there is no account system or server sync.

const KEY = "ctf_progress_v1";
const CURRENT_VERSION = 1;

function migrate(record) {
  if (!record || typeof record !== "object") {
    return { version: CURRENT_VERSION, challenges: {} };
  }
  if (record.version === CURRENT_VERSION) return record;
  // Future migrations would branch on record.version here.
  return { version: CURRENT_VERSION, challenges: record.challenges || {} };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  } catch {
    return { version: CURRENT_VERSION, challenges: {} };
  }
}

function save(record) {
  localStorage.setItem(KEY, JSON.stringify(record));
}

export function getChallengeState(id) {
  const record = loadProgress();
  return record.challenges[id] || null;
}

export function isSolved(id) {
  return Boolean(getChallengeState(id)?.solved);
}

export function recordSolve(id, { hintsUsed, pointsEarned }) {
  const record = loadProgress();
  if (record.challenges[id]?.solved) return record.challenges[id]; // already locked in
  record.challenges[id] = {
    solved: true,
    solvedAt: new Date().toISOString(),
    hintsUsed,
    pointsEarned,
  };
  save(record);
  return record.challenges[id];
}

export function recordHintUsed(id, hintIndex) {
  const record = loadProgress();
  const existing = record.challenges[id] || { solved: false, hintsUsed: 0 };
  existing.hintsUsed = Math.max(existing.hintsUsed || 0, hintIndex + 1);
  record.challenges[id] = existing;
  save(record);
  return existing;
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}
