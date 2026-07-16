import { challengesById } from "../data/index.js";
import { checkFlag } from "../lib/flagcheck.js";
import { getChallengeState, recordSolve, recordHintUsed } from "../lib/storage.js";
import { pointsAfterHints } from "../lib/scoring.js";
import { TIER_LABEL, CATEGORY_LABEL, qs, el } from "../lib/dom.js";
import { getParticipant } from "../lib/participant.js";
import { upsertSolve } from "../lib/firebase.js";

import { mountCaesarTool } from "../tools/caesar-rot13.js";
import { mountMultiDecoder } from "../tools/multi-decoder.js";
import { mountHexdump } from "../tools/hexdump.js";
import { mountLsbDecoder } from "../tools/lsb-decoder.js";
import { mountRsaToolkit } from "../tools/small-rsa-factor.js";
import { mountExifTool } from "../tools/exif-reader.js";
import { mountLogFilter } from "../tools/log-filter.js";

const id = qs("id");
const challenge = id && challengesById[id];
const root = document.getElementById("challenge-root");

if (!challenge) {
  root.innerHTML = `<p>Challenge not found. <a href="../index.html">Back to home</a></p>`;
} else {
  render();
}

function render() {
  document.title = `${challenge.title} — CTF`;
  const state = getChallengeState(challenge.id);

  root.append(
    el("div", { class: "challenge-head" }, [
      el("span", { class: `badge badge-${challenge.tier}` }, TIER_LABEL[challenge.tier]),
      el("h1", {}, challenge.title),
      el("span", { class: "challenge-points" }, `${challenge.points} pts`),
    ]),
    el("p", { class: "challenge-summary" }, `${CATEGORY_LABEL[challenge.category]} · ${challenge.summary}`)
  );

  if (state?.solved) {
    root.append(
      el("div", { class: "stamp-success" }, "Solved")
    );
  }

  root.append(el("div", { class: "challenge-prompt", html: challenge.prompt }));

  if (challenge.embed) {
    const wrap = el("div", { class: "challenge-embed-wrap" });
    wrap.append(
      el("iframe", {
        src: challenge.embed.src,
        height: String(challenge.embed.height),
        sandbox: challenge.embed.sandbox,
        loading: "lazy",
      }),
      el("div", {}, [
        el("a", { class: "open-in-tab", href: challenge.embed.src, target: "_blank", rel: "noopener" }, "Open challenge directly in a new tab ↗"),
      ])
    );
    root.append(wrap);
  }

  if (challenge.assets?.length) {
    const list = el("ul", { class: "assets-list" });
    for (const a of challenge.assets) {
      list.append(el("li", {}, [el("a", { href: a.path, download: "" }, a.label)]));
    }
    root.append(list);
  }

  if (challenge.tool) {
    const toolContainer = el("div", { id: "tool-container" });
    root.append(toolContainer);
    mountTool(toolContainer, challenge.tool);
  }

  root.append(renderHints(challenge, state));

  const debriefContainer = el("div", {});
  root.append(renderFlagForm(challenge, state, debriefContainer));
  root.append(debriefContainer);

  if (state?.solved) showDebrief(debriefContainer, challenge);
}

function showDebrief(container, challenge) {
  if (container.dataset.shown) return;
  container.dataset.shown = "true";
  container.append(
    el("div", { class: "debrief-section" }, [
      el("h2", {}, "Debrief: Why This Matters"),
      el("div", { class: "debrief-body", html: challenge.debrief }),
    ])
  );
}

function mountTool(container, tool) {
  switch (tool.type) {
    case "caesar":
      return mountCaesarTool(container, tool.ciphertext);
    case "multi-decoder":
      return mountMultiDecoder(container, tool.initialInput || "");
    case "hexdump":
      return mountHexdump(container, tool.url);
    case "lsb":
      return mountLsbDecoder(container, tool.imageUrl);
    case "rsa":
      return mountRsaToolkit(container, tool);
    case "exif":
      return mountExifTool(container, tool.imageUrl);
    case "log-filter":
      return mountLogFilter(container, tool.url);
  }
}

function renderHints(challenge, state) {
  const section = el("div", { class: "hints-section" }, [el("h2", {}, "Hints")]);
  let revealed = state?.hintsUsed || 0;

  const list = el("div", {});
  section.append(list);

  function draw() {
    list.innerHTML = "";
    for (let i = 0; i < challenge.hints.length; i++) {
      const hint = challenge.hints[i];
      const item = el("div", { class: "hint-item" });
      if (i < revealed) {
        item.append(
          el("div", { class: "hint-redaction" }, [
            el("span", {}, hint.text),
            hint.cost ? el("span", { class: "hint-cost" }, `−${hint.cost} pts`) : null,
          ])
        );
      } else if (i === revealed) {
        const btn = el("button", {
          class: "hint-reveal-btn",
          onclick: () => {
            revealed = Math.max(revealed, i + 1);
            recordHintUsed(challenge.id, i);
            draw();
          },
        }, `Show hint ${i + 1}${hint.cost ? ` (−${hint.cost} pts)` : " (free)"}`);
        item.append(btn);
      } else {
        break; // later hints stay unrendered until earlier ones are opened
      }
      list.append(item);
    }
  }
  draw();
  return section;
}

function renderFlagForm(challenge, state, debriefContainer) {
  const wrap = el("div", {});

  if (state?.solved) {
    wrap.append(el("p", { class: "flag-feedback correct" }, `You solved this for ${state.pointsEarned} points.`));
    return wrap;
  }

  const input = el("input", { type: "text", placeholder: challenge.flag.formatHint, autocomplete: "off" });
  const feedback = el("div", { class: "flag-feedback" });
  const form = el("form", {
    class: "flag-form",
    onsubmit: async (e) => {
      e.preventDefault();
      feedback.textContent = "Checking...";
      feedback.className = "flag-feedback";
      const correct = await checkFlag(challenge, input.value);
      if (correct) {
        const hintsUsed = getChallengeState(challenge.id)?.hintsUsed || 0;
        const pointsEarned = pointsAfterHints(challenge, hintsUsed);
        recordSolve(challenge.id, { hintsUsed, pointsEarned });
        const participant = getParticipant();
        if (participant) upsertSolve(participant.id, challenge.id, hintsUsed);
        feedback.className = "flag-feedback correct";
        feedback.textContent = `Correct! +${pointsEarned} points.`;
        input.disabled = true;
        form.querySelector("button").disabled = true;
        wrap.append(el("div", { class: "stamp-success" }, "Access Granted"));
        showDebrief(debriefContainer, challenge);
      } else {
        feedback.className = "flag-feedback incorrect";
        feedback.textContent = "Not quite — try again.";
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
      }
    },
  });
  form.append(input, el("button", { type: "submit", class: "primary" }, "Submit flag"), feedback);
  wrap.append(form);
  return wrap;
}
