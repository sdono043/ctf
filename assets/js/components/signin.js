import { getParticipant, signIn } from "../lib/participant.js";
import { el } from "../lib/dom.js";

export function mountSignIn(container) {
  function draw() {
    container.innerHTML = "";
    const participant = getParticipant();

    if (participant) {
      container.append(
        el("span", { class: "signin-status" }, [
          `Playing as ${participant.name} · `,
          el("a", { href: "#", onclick: (e) => { e.preventDefault(); showForm(); } }, "change"),
        ])
      );
      return;
    }
    showForm();
  }

  function showForm() {
    container.innerHTML = "";
    const input = el("input", { type: "text", class: "signin-input", placeholder: "Your name", maxlength: "60" });
    const btn = el("button", {
      class: "signin-btn",
      onclick: async () => {
        if (!input.value.trim()) return;
        btn.disabled = true;
        btn.textContent = "Saving...";
        await signIn(input.value);
        draw();
      },
    }, "Join leaderboard");
    container.append(
      el("span", { class: "signin-form" }, [input, btn])
    );
  }

  draw();
}
