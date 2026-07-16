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
    debrief: `
      <p><code>alg:none</code> and signature-verification bypasses are not
      hypothetical — they've appeared in real JWT libraries and products
      that trusted the algorithm named inside the token itself instead of
      enforcing it server-side. If the server asks "what algorithm did you
      use?" and believes the answer, there's nothing to verify at all.</p>
      <p><strong>Impact:</strong> this is a complete authentication
      bypass — an attacker can forge a token claiming to be an
      administrator, or any other user, with no password or key required.</p>
      <p><strong>What prevents this:</strong> the server must hardcode
      which algorithm(s) it accepts and never take that decision from the
      token, always verify signatures using a fixed server-side secret or
      key, and use a well-vetted JWT library rather than a hand-rolled
      implementation.</p>
      <p><strong>Real-world example:</strong> in 2015, researcher Tim
      McLean's disclosure of
      <a href="https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/" target="_blank" rel="noopener">critical JWT library vulnerabilities</a>
      showed multiple popular JWT libraries across languages accepted
      exactly this alg:none forgery.
      <a href="https://nvd.nist.gov/vuln/detail/CVE-2015-9235" target="_blank" rel="noopener">CVE-2015-9235</a>
      is the CVE assigned for the node-jsonwebtoken library specifically.</p>
    `,
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
    debrief: `
      <p>RSA's entire security rests on the modulus <strong>n</strong>
      being infeasible to factor. This isn't just theoretical: real-world
      studies (notably the 2012 "Mining Your Ps and Qs" research) found
      thousands of weak or duplicate RSA keys in the wild on embedded
      devices and routers, due to poor key generation and insufficient
      entropy at boot time.</p>
      <p><strong>Impact:</strong> an attacker who factors <strong>n</strong>
      recovers the entire private key — every message ever encrypted with
      that key can be decrypted, and every signature can be forged.</p>
      <p><strong>What prevents this:</strong> using standard key sizes
      (2048-bit minimum, 3072/4096-bit for longer-term protection),
      generating keys with established, audited cryptographic libraries,
      and never implementing RSA key generation by hand in a real system.</p>
      <p><strong>Real-world example:</strong>
      <a href="https://nvd.nist.gov/vuln/detail/CVE-2015-0204" target="_blank" rel="noopener">CVE-2015-0204</a>
      (the FREAK attack) let attackers downgrade connections to
      factorable 512-bit "export-grade" RSA keys.
      <a href="https://nvd.nist.gov/vuln/detail/CVE-2017-15361" target="_blank" rel="noopener">CVE-2017-15361</a>
      (ROCA) was worse: a flawed key-generation library produced
      factorable RSA keys up to 4096 bits, compromising over 750,000
      Estonian national ID cards along with TPM chips and YubiKey 4
      security tokens.</p>
    `,
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
    debrief: `
      <p>This is a scaled-down version of exactly what SOC (Security
      Operations Center) analysts do every day: sift enormous volumes of
      routine log data to spot the one anomalous pattern. A burst of
      failed logins from a single IP followed by an unusual value showing
      up in a request field is a textbook credential-stuffing-then-probing
      pattern.</p>
      <p><strong>Impact:</strong> this is literally how real intrusions
      get caught — or missed. Post-incident reviews of real breaches
      frequently find the warning signs were sitting in logs the whole
      time, just never surfaced or reviewed in time.</p>
      <p><strong>What prevents this:</strong> centralized logging with
      automated alerting (a SIEM) tuned to patterns like failed-login
      bursts and anomalous field values, plus log retention long enough
      to investigate after the fact.</p>
      <p><strong>Real-world note:</strong> this exact behavior — a burst
      of failed logins from one source, followed by unusual data in a
      request — is the classic pattern security teams train to watch for.
      It's precisely what public breach post-mortems repeatedly flag, in
      hindsight, as "the warning that got missed."</p>
    `,
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
    debrief: `
      <p>Correlating small details across supposedly-separate accounts —
      join dates, specific hobbies, writing style — is exactly how real
      OSINT investigators (and attackers) de-anonymize people or build
      targeting profiles. It's used both defensively, by researchers
      tracking threat actors, and offensively, by attackers piecing
      together an employee's professional and personal presence to craft
      a convincing spear-phishing pitch.</p>
      <p><strong>Impact:</strong> even accounts meant to stay separate or
      anonymous can often be linked with enough small correlated details
      — and attackers use exactly that link to make phishing attempts
      feel personal and credible, which is what makes spear-phishing so
      much more effective than generic phishing.</p>
      <p><strong>What prevents this:</strong> awareness of how much
      identifying detail (specific hobbies, join dates, writing patterns)
      carries over when reusing accounts across professional and
      personal/anonymous contexts — a core theme of spear-phishing
      resistance training.</p>
      <p><strong>Real-world example:</strong> in 2018, the fitness app
      Strava published a global heatmap aggregating users' public
      activity data. Researchers used it to identify the layout and
      patrol routes of secret military bases in Syria and Afghanistan,
      purely by correlating who was running where. Small, individually
      harmless data points, aggregated, can reveal far more than any one
      of them suggests alone.</p>
    `,
  },
  {
    id: "adv-web-2",
    tier: "advanced",
    category: "web",
    title: "The Metadata Pivot",
    points: 400,
    capstone: true,
    summary: "An internal tool imports data from any URL you give it. What else can it reach?",
    prompt: `
      <p>Below is an internal admin tool: it imports a vendor's product
      catalog from any URL you paste in, fetching it on the server side and
      showing you the result. Try the example vendor URL first — it works
      exactly as advertised.</p>
      <p>Cloud servers (AWS, and similar setups on other clouds) usually
      have a special internal-only address the machine can ask "who am I,
      and what am I allowed to do?" — it's how the server gets its own
      temporary credentials without a human typing a password into it.
      That address only makes sense to ask <em>from inside the server
      itself</em> — a person browsing the internet can't reach it. But if a
      feature on that server will fetch <em>any</em> URL you hand it, and
      nothing checks where that URL points, the server can be tricked into
      asking on your behalf and handing you the answer. This is a real,
      named class of bug: <strong>Server-Side Request Forgery (SSRF)</strong>.</p>
      <p>The address in question, on AWS, is always the same:
      <code>169.254.169.254</code>.</p>
    `,
    embed: { type: "iframe", src: "challenges/adv-web-2/index.html", height: 340, sandbox: "allow-scripts allow-forms" },
    hints: [
      { text: "Try the example vendor URL first to see the importer behave normally.", cost: 30 },
      { text: "Now try pointing it at the internal metadata address instead of a vendor URL: http://169.254.169.254/latest/meta-data/iam/security-credentials/", cost: 40 },
      { text: "Read the returned JSON carefully — one of the credential fields isn't quite what it should be.", cost: 50 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "ca5042831a123e98273f1f68d946dbc2cabc027cbb9e4dfa840e78ee9c526fa2",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    debrief: `
      <p>This is the exact mechanism behind one of the largest breaches in
      banking history. In 2019, Capital One suffered a breach exposing
      more than 100 million customers' data. The root cause: a
      misconfigured web application firewall let an attacker reach an
      SSRF-vulnerable internal application, which was then tricked into
      querying AWS's instance metadata service — and it handed over real,
      valid temporary IAM credentials. Those credentials were used to read
      and exfiltrate data from S3 storage buckets.</p>
      <p><strong>Impact:</strong> an SSRF bug turned a single misconfigured
      feature into a full cloud-account credential theft, and from there,
      a mass data breach — no password phishing, no malware, just an
      internal feature that trusted a URL it shouldn't have.</p>
      <p><strong>What prevents this:</strong> validating and allow-listing
      any URL a server-side feature is allowed to fetch; network-level
      controls that block application servers from reaching the metadata
      service unless they genuinely need to; and AWS's own response to
      this exact incident — a new, harder-to-abuse metadata service
      version (IMDSv2) that requires a special session token obtained via
      a separate request, specifically designed to make this class of SSRF
      pivot much harder to pull off.</p>
      <p><strong>Real-world example:</strong> classified as
      <a href="https://cwe.mitre.org/data/definitions/918.html" target="_blank" rel="noopener">CWE-918</a>
      (Server-Side Request Forgery). The attacker, Paige Thompson, was
      convicted on federal wire fraud and computer-intrusion charges; Capital
      One paid an $80 million penalty to the Office of the Comptroller of
      the Currency and settled related lawsuits for roughly $190 million on
      top of that.</p>
    `,
  },
];
