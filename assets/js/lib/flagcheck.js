// Client-side flag validation. Flags are never stored as plaintext here —
// only a SHA-256 digest ships in the data files. See tools/hash-generator.html
// for how new challenge hashes (and their random-suffix entropy) are authored.

export function normalizeFlag(raw, rules = {}) {
  let s = raw;
  if (rules.trim) s = s.trim();
  if (rules.lowercase) s = s.toLowerCase();
  return s;
}

export async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkFlag(challenge, userInput) {
  if (!crypto.subtle) {
    throw new Error(
      "crypto.subtle is unavailable — this page must be served over HTTPS or localhost, not opened as a file:// URL."
    );
  }
  const normalized = normalizeFlag(userInput, challenge.flag.normalize);
  const hex = await sha256Hex(normalized);
  return hex === challenge.flag.hash;
}
