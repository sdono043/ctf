// Fetches a binary asset and renders a scrollable hex + ASCII dump —
// the in-browser stand-in for a local hex-editor tool.

export async function mountHexdump(container, url) {
  container.innerHTML = "<p class=\"tool-loading\">Loading file...</p>";
  const res = await fetch(url);
  const buf = new Uint8Array(await res.arrayBuffer());

  const lines = [];
  for (let offset = 0; offset < buf.length; offset += 16) {
    const chunk = buf.slice(offset, offset + 16);
    const hex = Array.from(chunk).map((b) => b.toString(16).padStart(2, "0")).join(" ").padEnd(47, " ");
    const ascii = Array.from(chunk).map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
    lines.push(`${offset.toString(16).padStart(8, "0")}  ${hex}  ${ascii}`);
  }

  const pre = document.createElement("pre");
  pre.className = "tool-output tool-hexdump";
  pre.textContent = lines.join("\n");
  container.innerHTML = "";
  container.append(pre);
}
