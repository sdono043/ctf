// Trial-division factorer + modular-exponentiation decrypt toolkit for a
// deliberately small-modulus RSA challenge (n well under 10^8, factors in
// milliseconds in-browser).

function trialDivisionFactor(n) {
  const nb = BigInt(n);
  for (let p = 2n; p * p <= nb; p++) {
    if (nb % p === 0n) return [p, nb / p];
  }
  return null;
}

function modPow(base, exp, mod) {
  base %= mod;
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

function egcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = egcd(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

function modInverse(e, phi) {
  const [g, x] = egcd(e, phi);
  if (g !== 1n) return null;
  return ((x % phi) + phi) % phi;
}

export function mountRsaToolkit(container, { n, e, ciphertexts }) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const info = document.createElement("p");
  info.className = "tool-note";
  info.textContent = `n = ${n}, e = ${e}, ${ciphertexts.length} ciphertext block(s).`;

  const factorBtn = document.createElement("button");
  factorBtn.type = "button";
  factorBtn.textContent = "Factor n";

  const decryptBtn = document.createElement("button");
  decryptBtn.type = "button";
  decryptBtn.textContent = "Decrypt with recovered key";
  decryptBtn.disabled = true;

  const output = document.createElement("pre");
  output.className = "tool-output";

  let p, q, d;

  factorBtn.addEventListener("click", () => {
    const start = performance.now();
    const factors = trialDivisionFactor(n);
    const elapsed = (performance.now() - start).toFixed(1);
    if (!factors) {
      output.textContent = "Could not factor n (unexpected).";
      return;
    }
    [p, q] = factors;
    const phi = (p - 1n) * (q - 1n);
    d = modInverse(BigInt(e), phi);
    output.textContent = `Factored in ${elapsed}ms:\np = ${p}\nq = ${q}\nphi(n) = ${phi}\nd (private exponent) = ${d}`;
    decryptBtn.disabled = false;
  });

  decryptBtn.addEventListener("click", () => {
    const modulus = BigInt(n);
    const chars = ciphertexts.map((c) => {
      const m = modPow(BigInt(c), d, modulus);
      return String.fromCharCode(Number(m));
    });
    output.textContent += `\n\nDecrypted message:\n${chars.join("")}`;
  });

  wrap.append(info, factorBtn, decryptBtn, output);
  container.append(wrap);
}
