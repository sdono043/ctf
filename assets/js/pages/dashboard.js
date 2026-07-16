import { allChallenges } from "../data/index.js";
import { loadProgress, resetProgress } from "../lib/storage.js";
import { summarize } from "../lib/scoring.js";
import { TIER_LABEL, CATEGORY_LABEL, el } from "../lib/dom.js";

function draw() {
  const progress = loadProgress();
  const stats = summarize(allChallenges, progress);

  const root = document.getElementById("dashboard-root");
  root.innerHTML = "";

  root.append(
    el("div", { class: "dash-summary" }, [
      statTile(`${stats.totalEarned}`, `of ${stats.totalPossible} points`),
      statTile(`${stats.solvedCount}`, `of ${stats.total} solved`),
      statTile(`${Math.round((stats.solvedCount / stats.total) * 100) || 0}%`, "complete"),
    ])
  );

  root.append(breakdown("By Track", stats.byTier, TIER_LABEL, ["beginner", "intermediate", "advanced"]));
  root.append(breakdown("By Category", stats.byCategory, CATEGORY_LABEL, ["web", "crypto", "forensics", "osint"]));

  const solved = allChallenges
    .filter((c) => progress.challenges[c.id]?.solved)
    .map((c) => ({ c, state: progress.challenges[c.id] }))
    .sort((a, b) => new Date(b.state.solvedAt) - new Date(a.state.solvedAt));

  const solvedSection = el("div", { class: "breakdown-section" }, [el("h2", {}, "Solved Challenges")]);
  if (!solved.length) {
    solvedSection.append(el("p", { class: "tool-note" }, "Nothing solved yet — go pick a track."));
  } else {
    const list = el("ul", { class: "solved-list" });
    for (const { c, state } of solved) {
      list.append(
        el("li", {}, [
          el("a", { href: `challenge.html?id=${c.id}` }, c.title),
          el("span", { class: "ts" }, new Date(state.solvedAt).toLocaleString()),
        ])
      );
    }
    solvedSection.append(list);
  }
  root.append(solvedSection);

  const resetRow = el("div", { class: "reset-row" }, [
    el("p", {}, "Your progress lives only in this browser — switching devices or clearing site data starts fresh."),
    el("button", {
      onclick: () => {
        if (confirm("Reset all progress? This can't be undone.")) {
          resetProgress();
          draw();
        }
      },
    }, "Reset all progress"),
  ]);
  root.append(resetRow);
}

function statTile(value, label) {
  return el("div", { class: "stat-tile" }, [el("div", { class: "value" }, value), el("div", { class: "label" }, label)]);
}

function breakdown(title, data, labels, order) {
  const section = el("div", { class: "breakdown-section" }, [el("h2", {}, title)]);
  for (const key of order) {
    const d = data[key] || { solved: 0, total: 0, earned: 0, possible: 0 };
    const pct = d.possible ? Math.round((d.earned / d.possible) * 100) : 0;
    section.append(
      el("div", { class: "bar-row" }, [
        el("span", { class: "name" }, labels[key]),
        el("div", { class: "bar-track" }, [el("div", { class: "bar-fill", style: `width:${pct}%` })]),
        el("span", { class: "frac" }, `${d.solved}/${d.total}`),
      ])
    );
  }
  return section;
}

draw();
