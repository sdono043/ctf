import { allChallenges } from "../data/index.js";
import { loadProgress } from "../lib/storage.js";
import { CATEGORY_LABEL, el } from "../lib/dom.js";

const tier = document.body.dataset.tier;
const challenges = allChallenges.filter((c) => c.tier === tier);
const progress = loadProgress();

const root = document.getElementById("track-root");
const grid = el("div", { class: "card-grid" });

challenges.forEach((c, i) => {
  const solved = Boolean(progress.challenges[c.id]?.solved);
  const card = el("div", { class: `card${solved ? " solved" : ""}` }, [
    solved ? el("span", { class: "solved-stamp" }, "SOLVED") : null,
    el("span", { class: "badge mono" }, CATEGORY_LABEL[c.category]),
    el("h3", {}, c.title),
    el("p", {}, c.summary),
    el("p", { class: "points" }, `${c.points} pts`),
  ]);
  const link = el("a", { class: "card-link", href: `../challenge.html?id=${c.id}`, style: `animation-delay:${i * 60}ms` }, card);
  grid.append(link);
});

root.append(grid);
