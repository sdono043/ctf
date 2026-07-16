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
      <p><strong>How this actually happens:</strong> nobody decides to ship
      credentials to production on purpose. A developer hardcodes a key or
      leaves a "remove before launch" note while testing locally, it works,
      and it ships — because comments and hidden values don't show up in a
      visual review of the page, only in the actual source. This is
      classified as
      <a href="https://cwe.mitre.org/data/definitions/798.html" target="_blank" rel="noopener">CWE-798</a>
      (Use of Hard-Coded Credentials).</p>
      <p><strong>What an attacker actually does, and the tools they'd use:</strong>
      for one page, View Source is enough — what you just did. At scale,
      attackers (and security researchers) run automated secret-scanners
      like <strong>TruffleHog</strong> or <strong>GitLeaks</strong> — built
      to scan GitHub repos and JavaScript bundles for anything shaped like
      an API key or password — across thousands of sites and repositories
      at once, or simply pipe <code>curl</code> output through
      <code>grep</code> hunting for common credential patterns. Once found,
      a leaked key gets used directly to access whatever it unlocks — no
      further "hacking" required.</p>
      <p><strong>What prevents this:</strong> automated secret-scanning in
      CI/CD pipelines, pre-commit hooks that block credential-shaped
      strings before they're ever committed, and code review before
      anything reaches production.</p>
      <p><strong>Real-world example:</strong> Uber's 2016 breach of 57
      million riders' and drivers' records traced back to AWS credentials
      an engineer had committed to a private GitHub repo — the exact
      pattern you just found. <a href="https://nvd.nist.gov/vuln/detail/CVE-2017-14143" target="_blank" rel="noopener">CVE-2017-14143</a>
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
      <p><strong>How this actually happens:</strong> someone needs to
      "obscure" data quickly — a config value, a URL parameter, a note —
      and reaches for a simple substitution or encoding scheme because
      it's fast and looks scrambled, without realizing it adds no real
      security at all. The mistake is treating <em>obfuscation</em> (make
      it look unreadable) as if it were <em>encryption</em> (make it
      mathematically infeasible to read without a key).</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> the standard tool for this across the security
      community is <strong>CyberChef</strong> (built by GCHQ, genuinely
      nicknamed "the Cyber Swiss Army Knife") — a free web tool that tries
      every common cipher, shift, and encoding against a piece of text with
      a few clicks, exactly like the shift tool on this page. For a
      well-known cipher like this one, an attacker doesn't even need to
      think about it: they paste the text in, watch all 26 rotations at
      once, and read off whichever one makes sense — often in under ten
      seconds.</p>
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
      <p><strong>How this actually happens:</strong> file formats have
      well-defined structures, but many parsers and viewers stop reading at
      the "logical end" without checking whether anything follows — so
      appending extra data after that point is trivial and often invisible
      to normal use. That gap gets used both defensively (watermarking) and
      offensively — deliberately smuggling a payload inside an
      otherwise-legitimate file, past filters that only inspect what the
      file renders as. This kind of file is called a "polyglot".</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> exactly what you just did — pull the file into a hex
      viewer and scroll to the end, or run it through <strong>binwalk</strong>,
      a widely-used open-source tool built specifically to scan a file for
      embedded or appended content and automatically extract it. On a
      Mac/Linux machine, even basic commands like <code>file</code> and
      <code>strings</code> are often enough to notice a file is carrying
      more than it should.</p>
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
      <p><strong>How this actually happens:</strong> nobody sits down and
      says "let's hide sensitive data in the page." It happens by
      accident — a developer adds a hidden field for legitimate reasons
      (screen-reader accessibility text, an A/B test variant, a QA note)
      and puts real information in it instead of a placeholder, then
      forgets to remove it before the page goes live. It ships because
      nobody checks page source before publishing — only how the page
      <em>looks</em>.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> before a targeted phishing email or pretext phone call,
      attackers do reconnaissance — this is standard practice, not a
      Hollywood scenario. For one page, that's just View Source or
      DevTools, same as you did. At scale across a whole company, they
      don't browse manually — they run simple scripts
      (<code>curl</code>/<code>wget</code> piped into <code>grep</code>,
      or a quick Python scraper) to pull down hundreds of pages at once and
      search for anything that looks like a hidden field, an internal
      note, or a leftover credential. Two other tools show up constantly in
      real recon: the <strong>Wayback Machine</strong> (archive.org), which
      checks old cached snapshots of a page since a leak that's since been
      "fixed" on the live site often still exists in an archived version;
      and <strong>search-engine dorking</strong> — targeted search
      operators (e.g. <code>site:company.com "internal"</code>) that
      surface pages already indexed with sensitive-looking text, no visit
      required. For a broader campaign, attackers often point an OSINT
      aggregation tool — <strong>theHarvester</strong>,
      <strong>Maltego</strong>, or <strong>SpiderFoot</strong> are the
      well-known ones — at a company domain or employee name to
      automatically pull together everything public at once.</p>
      <p><strong>What prevents this:</strong> treat "hidden from view" as
      public, not private — anything in a page's source should be assumed
      readable by anyone, with any tool, at any point in the future
      (archives don't forget). Review what's actually in the HTML before
      publishing, not just how it renders.</p>
    `,
  },
];
