export const advancedChallenges = [
  {
    id: "adv-web-1",
    tier: "advanced",
    category: "web",
    title: "Trust No One",
    points: 250,
    summary: "The session panel never checks whether the token is genuine.",
    prompt: `
      <p>The panel below shows a session token in the classic
      <code>header.payload.signature</code> format used by JSON Web Tokens
      (JWTs). Real JWTs are cryptographically signed so the server can detect
      tampering — but this one's header claims <code>"alg":"none"</code>,
      and the app never verifies a signature at all.</p>
      <p>If nothing checks the signature, nothing stops you from editing the
      payload and handing back your own version.</p>
    `,
    embed: { type: "iframe", src: "challenges/adv-web-1/index.html", height: 360, sandbox: "allow-scripts allow-forms" },
    hints: [
      { text: "Each segment between the dots is Base64URL — decode the second segment (the payload) to see its JSON claims.", cost: 40 },
      { text: "Change the role claim, then re-encode just that segment back to Base64URL and reassemble header.payload. (the trailing empty signature segment is fine to leave blank)", cost: 50 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "e38a23f71c268dbaba1275144022c2a55343d59a2310cd65ff842c77486e3d07",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
  },
  {
    id: "adv-crypto-1",
    tier: "advanced",
    category: "crypto",
    title: "Small n, Big Mistake",
    points: 250,
    summary: "RSA is only as strong as its modulus. This one's much too small.",
    prompt: `
      <p>An RSA-\"encrypted\" message, one character at a time:</p>
      <p><strong>n</strong> = 99400891, <strong>e</strong> = 17</p>
      <p>Ciphertext blocks (one per character of the original message):</p>
      <pre style="white-space:pre-wrap;word-break:break-all;">81570652, 25252242, 1424691, 40607615, 19705425, 16872659, 78335932, 62065736, 25252242, 25252242, 53983290, 97261355, 53983290, 7999775, 25252242, 62065736, 78335932, 33522423, 53983290, 6758587, 11828661, 32164552, 53983290, 68309953, 18186369, 72817857, 78335932, 32164552, 16872659, 29919534, 98861842, 33522423, 55534714, 98861842, 55534714, 81570652, 98861842, 72817857, 81570652, 32164552, 89990563</pre>
      <p>RSA's security depends on <strong>n</strong> being the product of two
      huge primes that can't be factored in a reasonable time. This
      <strong>n</strong> is under 10<sup>8</sup> — small enough that a simple
      trial-division search factors it instantly.</p>
    `,
    tool: {
      type: "rsa",
      n: 99400891,
      e: 17,
      ciphertexts: [81570652,25252242,1424691,40607615,19705425,16872659,78335932,62065736,25252242,25252242,53983290,97261355,53983290,7999775,25252242,62065736,78335932,33522423,53983290,6758587,11828661,32164552,53983290,68309953,18186369,72817857,78335932,32164552,16872659,29919534,98861842,33522423,55534714,98861842,55534714,81570652,98861842,72817857,81570652,32164552,89990563],
    },
    hints: [
      { text: "Click \"Factor n\" — trial division up to sqrt(n) is well under a second for an 8-digit number.", cost: 40 },
      { text: "Once you have p and q, phi(n) = (p-1)(q-1), and d is the modular inverse of e mod phi(n) — the tool computes both automatically.", cost: 30 },
      { text: "Click \"Decrypt with recovered key\" to decrypt every ciphertext block back into the original character.", cost: 30 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "4a31f31bba0ccd8c07c615301902f478b9400f34350d59e393860219df1b4e82",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
  },
  {
    id: "adv-forensics-1",
    tier: "advanced",
    category: "forensics",
    title: "Needle in the Logstack",
    points: 250,
    summary: "One anomalous line is hiding among hundreds of routine ones.",
    prompt: `
      <p>Below is a web server access log covering a few hours of traffic.
      Most of it is routine. Somewhere in it, one IP address made a burst of
      failed login attempts followed by a request carrying something it
      shouldn't.</p>
      <p><a href="assets/downloads/forensics/adv-forensics-1-auth.log" download>Download the raw log file</a></p>
    `,
    assets: [{ type: "log", path: "assets/downloads/forensics/adv-forensics-1-auth.log", label: "adv-forensics-1-auth.log" }],
    tool: { type: "log-filter", url: "assets/downloads/forensics/adv-forensics-1-auth.log" },
    hints: [
      { text: "Filter for \"401\" to find every failed login and see which IP repeats unusually often.", cost: 40 },
      { text: "Once you've found the suspicious IP, filter by that IP address alone and read every line it produced.", cost: 35 },
      { text: "One of its requests has an unusual User-Agent string carrying a Base64-looking fragment — decode it.", cost: 35 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "bce83698dceff8d4c6c0c04977c04310cf678609ae89f0bc209f00276795a06f",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
  },
  {
    id: "adv-osint-1",
    tier: "advanced",
    category: "osint",
    title: "Correlate the Records",
    points: 250,
    summary: "Two leaked datasets. One person appears in both.",
    prompt: `
      <p>Below are two small leaked datasets from unrelated platforms:
      GitBucket (a dev platform) and SnapFeed (a social platform). One real
      person maintains an account on both. Cross-reference join dates,
      timezones, and bio details across the two lists to find the matching
      pair, then read that SnapFeed account's post history.</p>
      <p><a href="assets/data/osint/adv-osint-1-records.json" download>Download the datasets (JSON)</a></p>
    `,
    assets: [{ type: "data", path: "assets/data/osint/adv-osint-1-records.json", label: "adv-osint-1-records.json" }],
    hints: [
      { text: "Start with join date and timezone — narrow the 4x4 possibilities down to a couple of plausible pairs.", cost: 40 },
      { text: "The strongest match shares a distinctive, specific hobby detail across both bios, not just a generic one.", cost: 40 },
      { text: "Read every post in that SnapFeed account's post history, not just the bio.", cost: 30 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "0619b39cf71785a78221645c18bfad5a254d269682ceb2f144d07828dc433dd8",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
  },
];
