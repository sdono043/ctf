export const beginnerChallenges = [
  {
    id: "beg-web-1",
    tier: "beginner",
    category: "web",
    title: "View Source, Young Padawan",
    points: 75,
    summary: "There's a login page. Something is hiding in plain sight.",
    prompt: `
      <p>This site has a login form guarding a secret. You don't need to guess
      any password — the flag is already sitting in the page, just not visible
      on screen.</p>
      <p><strong>Try:</strong> right-click the embedded page below &rarr;
      "View Page Source" (or open DevTools with F12 &rarr; Elements tab) and
      read through the HTML carefully, including anything that looks like a
      comment.</p>
    `,
    embed: { type: "iframe", src: "challenges/beg-web-1/index.html", height: 420, sandbox: "allow-scripts allow-forms" },
    hints: [
      { text: "Right-click anywhere on the embedded page and choose \"View Page Source\", or open DevTools with F12.", cost: 0 },
      { text: "HTML comments look like <!-- this --> and never render on screen, but they're still in the file.", cost: 0 },
      { text: "Look near the <form> element — there's a comment left behind by a developer.", cost: 0 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "811fef0d9d5eece33255387ad196ef13c61a630e2a63d2224ea18aef84a08c4f",
      normalize: { trim: true, lowercase: true },
      formatHint: "flag{...}",
    },
    debrief: `
      <p>Developers routinely leave debug comments, "temporary" notes, or
      even hardcoded credentials in code that ships to production — and
      anything sent to a browser is fully visible to anyone who looks,
      comment or not. This is one of the most common real-world security
      findings: leaked API keys and internal notes committed to public
      repos or shipped in client-side bundles.</p>
      <p><strong>Impact:</strong> attackers run automated scanners that
      constantly search public sites and repositories for exactly this
      pattern. A single forgotten comment has led to full account or
      database compromises at real companies.</p>
      <p><strong>What prevents this:</strong> automated secret-scanning in
      CI/CD pipelines, pre-commit hooks that block credential-shaped
      strings, and code review before anything reaches production.</p>
      <p><strong>Real-world example:</strong> classified as
      <a href="https://cwe.mitre.org/data/definitions/798.html" target="_blank" rel="noopener">CWE-798</a>
      (Use of Hard-Coded Credentials). Uber's 2016 breach of 57 million
      riders' and drivers' records traced back to AWS credentials an
      engineer had committed to a private GitHub repo — the exact pattern
      you just found. <a href="https://nvd.nist.gov/vuln/detail/CVE-2017-14143" target="_blank" rel="noopener">CVE-2017-14143</a>
      is a similar case: a hardcoded secret cookie value baked into the
      Kaltura media server.</p>
    `,
  },
  {
    id: "beg-crypto-1",
    tier: "beginner",
    category: "crypto",
    title: "Caesar Salad",
    points: 75,
    summary: "A message has been shifted. Find the right amount and read it.",
    prompt: `
      <p>Julius Caesar reportedly shifted every letter of his messages by a
      fixed amount. Someone did the same thing here:</p>
      <p><code>mshn{j435hy_5hs4k_zo1ma3k-586i894l51}</code></p>
      <p>Use the shift tool below to try every rotation until the message
      turns into a readable flag. Notice that digits, dashes, and braces never
      change — only letters shift — so watch for <code>flag{...}</code> to
      snap into focus.</p>
    `,
    tool: { type: "caesar", ciphertext: "mshn{j435hy_5hs4k_zo1ma3k-586i894l51}" },
    hints: [
      { text: "Drag the slider from 0 to 25 and watch the output update live.", cost: 0 },
      { text: "The braces { } and dashes never change — use them as anchors to know when you're close.", cost: 0 },
      { text: "The correct shift is a single-digit number.", cost: 0 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "43552ad28d02313b898572baa0352daeb369bcf22810b925801b8dca36a298bd",
      normalize: { trim: true, lowercase: true },
      formatHint: "flag{...}",
    },
    debrief: `
      <p>Caesar/ROT ciphers aren't real security — they're a teaching tool.
      The real lesson: <strong>obfuscation is not encryption.</strong>
      Companies sometimes mistake simple substitution or encoding (ROT13,
      Base64, XOR) for genuine protection of sensitive data, when it offers
      essentially zero resistance to anyone who looks.</p>
      <p><strong>Impact:</strong> data "protected" this way is broken in
      seconds — often faster than it took to encode it in the first place.
      Relying on it for anything sensitive (passwords, tokens, PII) gives a
      false sense of security that's arguably worse than no protection at
      all, since it invites complacency.</p>
      <p><strong>What prevents this:</strong> use vetted, modern
      cryptography (AES, etc.) for anything that actually needs
      confidentiality, and never treat encoding schemes as encryption.</p>
      <p><strong>Real-world note:</strong> there's no CVE for "someone used
      ROT13" — because nobody with real security requirements should ever
      rely on it. That's exactly the lesson: this technique's only honest
      use is a puzzle, not protection.</p>
    `,
  },
  {
    id: "beg-forensics-1",
    tier: "beginner",
    category: "forensics",
    title: "What's After The End?",
    points: 75,
    summary: "A PNG image file has a defined ending. What's hiding past it?",
    prompt: `
      <p>Every PNG file ends with a special chunk called <code>IEND</code> —
      it marks the true end of the image data. Image viewers stop reading
      there... but a file can keep going past that point, and most viewers
      will never show you what's stuffed in after it.</p>
      <p>Download the image below, then use the hex-dump tool to look at its
      raw bytes and scroll to the very end of the file.</p>
      <p><a href="assets/img/stego/beg-forensics-1.png" download>Download beg-forensics-1.png</a></p>
    `,
    assets: [{ type: "image", path: "assets/img/stego/beg-forensics-1.png", label: "beg-forensics-1.png" }],
    tool: { type: "hexdump", url: "assets/img/stego/beg-forensics-1.png" },
    hints: [
      { text: "Search the hex dump's ASCII column (the right-hand side) for readable text.", cost: 0 },
      { text: "It's after the bytes spelling out \"IEND\" near the bottom of the dump.", cost: 0 },
      { text: "The hidden text is plain readable ASCII — no decoding needed once you spot it.", cost: 0 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "2967598074f8e74d887abf8dd94af68a46fc79b74044f39948fca705fb90bade",
      normalize: { trim: true, lowercase: true },
      formatHint: "flag{...}",
    },
    debrief: `
      <p>File formats have well-defined structures, but many parsers and
      viewers stop reading at the "logical end" without checking whether
      anything follows. That gap gets used both defensively (watermarking,
      steganography) and offensively — malware and exfiltrated data have
      been smuggled inside otherwise-legitimate image files as trailing
      bytes past the declared end, sometimes called a "polyglot file".</p>
      <p><strong>Impact:</strong> security tools that only render or
      preview a file — rather than fully parsing and validating it — can
      completely miss payloads or exfiltrated data hidden this way,
      including in systems meant to block exactly that (DLP/upload
      scanners).</p>
      <p><strong>What prevents this:</strong> file validation that parses
      to the exact expected end and flags trailing data, and content
      scanners that hash/inspect entire files rather than just what
      renders.</p>
      <p><strong>Real-world example:</strong> this "append after the real
      end" trick is called a polyglot file.
      <a href="https://nvd.nist.gov/vuln/detail/CVE-2020-1464" target="_blank" rel="noopener">CVE-2020-1464</a>
      ("GlueBall") let attackers append a malicious JAR to a
      legitimately-signed Windows installer without invalidating its
      signature; <a href="https://nvd.nist.gov/vuln/detail/CVE-2020-1599" target="_blank" rel="noopener">CVE-2020-1599</a>
      did the same trick with script data appended after a signed Windows
      executable.</p>
    `,
  },
  {
    id: "beg-osint-1",
    tier: "beginner",
    category: "osint",
    title: "The Pinned Post",
    points: 75,
    summary: "A social profile's pinned post looks innocent. Look closer.",
    prompt: `
      <p>OSINT (open-source intelligence) is about reading everything on a
      page carefully — not just what's visible at a glance. Below is a mock
      social profile. Something is attached to the pinned post that isn't
      visible on screen, but it's still part of the page.</p>
      <p><strong>Try:</strong> View Page Source, or select all the text on the
      pinned post (Ctrl/Cmd+A then copy) — some page elements are hidden
      visually but still present in the HTML and copyable text.</p>
    `,
    embed: { type: "iframe", src: "challenges/beg-osint-1/profile.html", height: 320, sandbox: "allow-scripts" },
    tool: { type: "multi-decoder" },
    hints: [
      { text: "View the page's source HTML and look inside the pinned post's <p> element.", cost: 0 },
      { text: "There's a <span> styled to be invisible on screen but still present in the markup.", cost: 0 },
      { text: "Its text looks like Base64 — paste it into the decoder tool below and click \"Base64 decode\".", cost: 0 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "d0cc725579118945c5286e00e635ecce2d6c27fefff51818d34591dfb87605cf",
      normalize: { trim: true, lowercase: true },
      formatHint: "flag{...}",
    },
    debrief: `
      <p>This mirrors real OSINT reconnaissance: people (and companies)
      sometimes leave sensitive information in metadata, alt-text, or
      visually-hidden page elements they assume nobody actually reads —
      and researchers, and attackers, rely on exactly that assumption.
      It's also a preview of social-engineering recon: attackers who
      target a specific person or company genuinely read everything
      public, not just skim it, to build a profile for phishing.</p>
      <p><strong>Impact:</strong> oversharing "harmless" details, or
      developers leaving hidden debug/config data on public pages, both
      hand attackers free reconnaissance material they'd otherwise have to
      work for.</p>
      <p><strong>What prevents this:</strong> security-awareness training
      like this one, and periodic audits of public-facing pages and
      profiles for accidental data leakage.</p>
      <p><strong>Real-world note:</strong> this is exactly the recon phase
      real attackers do before a targeted phishing attempt — quietly
      reading everything public about a target, including the parts
      nobody expects to be read.</p>
    `,
  },
];
