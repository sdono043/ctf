// Chainable mini decoder: base64 <-> text, hex <-> text, single-byte XOR
// (manual key or brute-force all 256 keys, ranked by printable-character ratio).

function base64Decode(str) {
  try {
    return atob(str.trim());
  } catch {
    return null;
  }
}
function base64Encode(str) {
  return btoa(str);
}
function hexDecode(str) {
  const clean = str.trim().replace(/\s+/g, "");
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) return null;
  let out = "";
  for (let i = 0; i < clean.length; i += 2) out += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
  return out;
}
function xorSingleByte(str, key) {
  let out = "";
  for (let i = 0; i < str.length; i++) out += String.fromCharCode(str.charCodeAt(i) ^ key);
  return out;
}
function printableRatio(str) {
  let printable = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 32 && c < 127) printable++;
  }
  return str.length ? printable / str.length : 0;
}

// Printable-ASCII alone barely discriminates between XOR keys, since small
// keys tend to keep printable input printable regardless of correctness.
// A result that happens to be pure Base64-alphabet is a much rarer,
// stronger signal, so it's weighted well above plain printability.
function candidateScore(str) {
  const base64Like = /^[A-Za-z0-9+/]+=*$/.test(str);
  return printableRatio(str) + (base64Like ? 10 : 0);
}

export function mountMultiDecoder(container, initialInput = "") {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const input = document.createElement("textarea");
  input.className = "tool-input";
  input.rows = 3;
  input.value = initialInput;
  input.placeholder = "Paste ciphertext here...";

  const controls = document.createElement("div");
  controls.className = "tool-row tool-row-wrap";

  const btnB64Dec = mkBtn("Base64 decode");
  const btnB64Enc = mkBtn("Base64 encode");
  const btnHexDec = mkBtn("Hex decode");
  const btnXor = mkBtn("XOR with key");
  const xorKeyInput = document.createElement("input");
  xorKeyInput.type = "text";
  xorKeyInput.className = "tool-key-input";
  xorKeyInput.placeholder = "key (single char)";
  const btnBrute = mkBtn("Brute-force XOR (all 256 keys)");

  controls.append(btnB64Dec, btnB64Enc, btnHexDec, xorKeyInput, btnXor, btnBrute);

  const output = document.createElement("pre");
  output.className = "tool-output";

  function mkBtn(text) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    return b;
  }

  btnB64Dec.addEventListener("click", () => {
    const decoded = base64Decode(input.value);
    input.value = decoded ?? "(not valid base64)";
  });
  btnB64Enc.addEventListener("click", () => {
    input.value = base64Encode(input.value);
  });
  btnHexDec.addEventListener("click", () => {
    const decoded = hexDecode(input.value);
    input.value = decoded ?? "(not valid hex)";
  });
  btnXor.addEventListener("click", () => {
    const key = xorKeyInput.value.charCodeAt(0);
    if (Number.isNaN(key)) return;
    input.value = xorSingleByte(input.value, key);
  });
  btnBrute.addEventListener("click", () => {
    const candidates = [];
    for (let key = 0; key < 256; key++) {
      const result = xorSingleByte(input.value, key);
      candidates.push({ key, result, score: candidateScore(result) });
    }
    candidates.sort((a, b) => b.score - a.score);
    output.textContent = candidates
      .slice(0, 8)
      .map((c) => `key=0x${c.key.toString(16).padStart(2, "0")} (${(printableRatio(c.result) * 100).toFixed(0)}% printable): ${c.result}`)
      .join("\n");
  });

  wrap.append(input, controls, output);
  container.append(wrap);
}
