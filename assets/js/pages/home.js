import { allChallenges } from "../data/index.js";
import { loadProgress } from "../lib/storage.js";
import { summarize } from "../lib/scoring.js";
import { el } from "../lib/dom.js";

const progress = loadProgress();
const stats = summarize(allChallenges, progress);

const root = document.getElementById("tier-root");

const tiers = [
  { key: "beginner", label: "Recruit", href: "tracks/beginner.html", desc: "Start here. Heavy hand-holding, free staged hints, gentle intro to core techniques." },
  { key: "intermediate", label: "Field Agent", href: "tracks/intermediate.html", desc: "Less hand-holding, hints cost points, patterns closer to real-world bugs." },
  { key: "advanced", label: "Classified", href: "tracks/advanced.html", desc: "Few, pricey hints. Meant to feel like an unassisted real puzzle." },
];

const grid = el("div", { class: "card-grid" });
tiers.forEach((t, i) => {
  const s = stats.byTier[t.key] || { solved: 0, total: 0, earned: 0, possible: 0 };
  const card = el("div", { class: "card" }, [
    el("span", { class: `badge badge-${t.key}` }, t.label),
    el("h3", {}, `${t.label} Track`),
    el("p", {}, t.desc),
    el("p", { class: "points" }, `${s.solved}/${s.total} solved · ${s.earned}/${s.possible} pts`),
  ]);
  grid.append(el("a", { class: "card-link", href: t.href, style: `animation-delay:${i * 80}ms` }, card));
});
root.append(grid);
