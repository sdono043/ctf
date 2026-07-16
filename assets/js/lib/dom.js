export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

export const TIER_LABEL = { beginner: "Recruit", intermediate: "Field Agent", advanced: "Classified" };
export const CATEGORY_LABEL = { web: "Web Exploitation", crypto: "Cryptography", forensics: "Forensics", osint: "OSINT" };

export function qs(name, fallback = null) {
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}
