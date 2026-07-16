// Fetches a plain-text log and lets the player filter lines by a search
// string or regex — the static-site stand-in for grepping a real log file.

export async function mountLogFilter(container, url) {
  container.innerHTML = "<p class=\"tool-loading\">Loading log...</p>";
  const res = await fetch(url);
  const text = await res.text();
  const allLines = text.split("\n").filter(Boolean);

  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "tool-key-input";
  input.placeholder = "Filter (plain text or /regex/)";
  input.style.width = "100%";

  const meta = document.createElement("p");
  meta.className = "tool-note";
  meta.textContent = `${allLines.length} lines loaded.`;

  const output = document.createElement("pre");
  output.className = "tool-output tool-hexdump";

  function render(filterText) {
    let matched = allLines;
    if (filterText) {
      const regexMatch = filterText.match(/^\/(.*)\/([a-z]*)$/);
      try {
        const test = regexMatch
          ? new RegExp(regexMatch[1], regexMatch[2])
          : null;
        matched = allLines.filter((line) =>
          test ? test.test(line) : line.toLowerCase().includes(filterText.toLowerCase())
        );
      } catch {
        matched = [];
      }
    }
    output.textContent = matched.slice(0, 500).join("\n") || "(no matching lines)";
    meta.textContent = `${matched.length} of ${allLines.length} lines match.`;
  }

  input.addEventListener("input", () => render(input.value));

  wrap.append(input, meta, output);
  container.innerHTML = "";
  container.append(wrap);
  render("");
}
