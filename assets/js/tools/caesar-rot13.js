// Caesar/shift-cipher widget: a slider tries all 26 shifts against the given
// ciphertext so a beginner can eyeball which one produces readable text.

function shift(str, n) {
  return str.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + n) % 26 + 26) % 26 + base);
  });
}

export function mountCaesarTool(container, ciphertext) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const label = document.createElement("label");
  label.textContent = "Shift amount";
  label.className = "tool-label";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "25";
  slider.value = "0";

  const shiftValue = document.createElement("span");
  shiftValue.className = "tool-badge";
  shiftValue.textContent = "0";

  const output = document.createElement("pre");
  output.className = "tool-output";
  output.textContent = ciphertext;

  const update = () => {
    const n = Number(slider.value);
    shiftValue.textContent = String(n);
    output.textContent = shift(ciphertext, n);
  };
  slider.addEventListener("input", update);

  const row = document.createElement("div");
  row.className = "tool-row";
  row.append(label, slider, shiftValue);

  wrap.append(row, output);
  container.append(wrap);
  update();
}
