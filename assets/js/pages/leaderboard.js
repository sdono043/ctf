import { allChallenges, challengesById } from "../data/index.js";
import { pointsAfterHints } from "../lib/scoring.js";
import { fetchAllParticipants, fetchAllSolves } from "../lib/firebase.js";
import { el } from "../lib/dom.js";

const root = document.getElementById("leaderboard-root");

async function draw() {
  root.innerHTML = `<p class="tool-loading">Loading leaderboard...</p>`;

  let participants, solves;
  try {
    [participants, solves] = await Promise.all([fetchAllParticipants(), fetchAllSolves()]);
  } catch (err) {
    root.innerHTML = `<p class="flag-feedback incorrect">Couldn't load the leaderboard right now. Try refreshing.</p>`;
    console.error(err);
    return;
  }

  // Points are never trusted from the client — recompute every solve's
  // value here from the challenge's known point value and hint costs,
  // driven only by hintsUsed (the one thing actually stored remotely).
  const totals = new Map();
  for (const p of participants) totals.set(p.id, { name: p.name, score: 0, solved: 0 });

  for (const solve of solves) {
    const challenge = challengesById[solve.challengeId];
    const entry = totals.get(solve.participantId);
    if (!challenge || !entry) continue;
    entry.score += pointsAfterHints(challenge, solve.hintsUsed || 0);
    entry.solved += 1;
  }

  const ranked = [...totals.values()]
    .filter((e) => e.solved > 0)
    .sort((a, b) => b.score - a.score || b.solved - a.solved);

  root.innerHTML = "";

  if (!ranked.length) {
    root.append(el("p", { class: "tool-note" }, "No one's on the board yet — be the first to sign in and solve a challenge."));
    return;
  }

  const totalPossible = allChallenges.reduce((sum, c) => sum + c.points, 0);
  const list = el("ol", { class: "leaderboard-list" });
  ranked.forEach((entry, i) => {
    list.append(
      el("li", { class: `leaderboard-row rank-${i + 1 <= 3 ? i + 1 : "other"}` }, [
        el("span", { class: "rank" }, `#${i + 1}`),
        el("span", { class: "name" }, entry.name),
        el("span", { class: "solved" }, `${entry.solved}/${allChallenges.length} solved`),
        el("span", { class: "score" }, `${entry.score}/${totalPossible} pts`),
      ])
    );
  });
  root.append(list);
}

draw();
