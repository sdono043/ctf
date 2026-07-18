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
    recap: `
      <p><strong>How this actually happens:</strong> a developer implements
      JWT verification themselves, or uses a library whose older API made
      it easy to get wrong, and writes code that trusts the algorithm
      named inside the token instead of hardcoding what the server actually
      expects. It's an understandable mistake — the token format
      technically supports naming its own algorithm — but if the server
      believes whatever the token claims about itself, there's nothing left
      to verify.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> exactly what you just did by hand — decode the payload,
      change a claim, re-encode it. A dedicated tool called
      <strong>jwt_tool</strong> automates this entire class of JWT attack
      (alg:none, algorithm confusion, and others) against a live target,
      and the debugger at <strong>jwt.io</strong> is the everyday tool
      security researchers use to decode and inspect tokens manually. None
      of this requires cracking any cryptography — the "attack" is just
      reading and rewriting a token the server never actually checked.</p>
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
    recap: `
      <p><strong>How this actually happens:</strong> RSA's entire security
      rests on the modulus <strong>n</strong> being infeasible to factor —
      which means it depends entirely on the two primes that generated it
      being genuinely huge and genuinely random. That guarantee breaks
      down in a few very real ways: someone rolls their own key generation
      instead of using an audited library, a device generates keys right
      at boot before it has gathered enough randomness (insufficient
      entropy), or older export regulations forced weaker key sizes into
      products by design. None of these are exotic mistakes — they've all
      happened in shipped, real products.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> exactly what you just did — factor <strong>n</strong>.
      For small or weak moduli, the dedicated open-source tool is
      <strong>RsaCtfTool</strong>, built specifically to try a whole
      battery of known attacks against a weak RSA public key and recover
      the private key automatically. For a modulus that's already been
      factored by someone else, <strong>factordb.com</strong> is a public
      lookup service researchers check before doing any work themselves.</p>
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
    recap: `
      <p><strong>How this actually unfolds:</strong> an attacker with a
      list of leaked username/password combinations (from some unrelated
      previous breach) runs them against a login page automatically —
      that's the burst of failed logins. When one combination works, or
      when they pivot to probing the app itself, that next request often
      carries something unusual, exactly like the anomalous line you
      found. This isn't a bug being introduced by mistake — it's an attack
      actively unfolding in real time, which is why catching it depends
      entirely on someone (or something) actually watching the logs.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> automated credential-testing tools like
      <strong>Hydra</strong> exist specifically to hammer a login form
      with thousands of username/password pairs far faster than a human
      could type them. On the defense side, this is exactly what SOC
      (Security Operations Center) analysts do every day, using tools like
      <strong>Splunk</strong> or the open-source <strong>ELK stack</strong>
      (Elasticsearch, Logstash, Kibana) to search and alert on patterns
      like this across millions of log lines — the same search-and-filter
      motion you just did by hand, just automated and running continuously.</p>
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
    recap: `
      <p><strong>How this actually unfolds:</strong> people reuse
      identifying details — a specific hobby, a join date, a writing
      style — across accounts they think of as separate (a professional
      LinkedIn vs. an anonymous hobby forum, say) without realizing how
      identifying the <em>combination</em> becomes, even when no single
      detail is sensitive on its own.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> for a specific username, <strong>Sherlock</strong> is
      a well-known open-source tool that checks hundreds of social
      platforms simultaneously to see where else that exact username
      appears — turning what you just did manually (checking join dates
      and bios one at a time) into a single automated sweep.
      <strong>Maltego</strong> goes further, visually mapping the links
      between accounts, emails, and other identifiers it discovers, which
      is how an attacker builds a full profile of a target before crafting
      a convincing spear-phishing pitch that references real, specific
      details about that person's life.</p>
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
    id: "adv-web-3",
    tier: "advanced",
    category: "web",
    title: "The Gap in the Rule",
    points: 250,
    summary: "Five sites, five different responses to the same advisory. Only one is still actually exploitable.",
    prompt: `
      <p>The same WordPress core advisory from earlier ("Patch or Panic",
      "Batch Job") gave defenders exactly three ways to protect a site while
      waiting to patch:</p>
      <ol>
        <li>Upgrade to 7.0.2 (or 6.9.5 on the 6.9 branch).</li>
        <li>Install a plugin that blocks anonymous access to the REST API
        entirely.</li>
        <li>Block <em>both</em> <code>/wp-json/batch/v1</code> and
        <code>?rest_route=/batch/v1</code> at a WAF level — WordPress's REST
        API is reachable through either URL form, so a rule covering only
        one leaves the other wide open.</li>
      </ol>
      <p>Below is a small fleet of five sites and how each one responded to
      the advisory. Four are genuinely safe right now, for different valid
      reasons. One only <em>looks</em> safe — a WAF rule went in, a ticket
      got closed, but the endpoint is still reachable through its other URL
      form. Find that site.</p>
      <p><a href="assets/data/web/adv-web-3-fleet.json" download>Download the fleet status (JSON)</a></p>
    `,
    assets: [{ type: "data", path: "assets/data/web/adv-web-3-fleet.json", label: "adv-web-3-fleet.json" }],
    hints: [
      { text: "Rule out sites by version first: anything ≤6.8.5 or already upgraded to a fixed release is safe regardless of WAF rules.", cost: 40 },
      { text: "Of the remaining affected-version sites, one has the anonymous-REST-blocking plugin — that covers every route, no gaps possible.", cost: 35 },
      { text: "Compare the two remaining sites' \"waf_rules_blocking\" arrays against the advisory's two named URL forms — one array is missing an entry.", cost: 35 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "cdc54170370968152cec45e6ca6cdf046ea0ca7bb87cf0de3274b61b1e2bd352",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    recap: `
      <p><strong>How this actually happens:</strong> a WAF rule gets written
      against the exact path named in an advisory, a ticket gets marked
      resolved, and nobody re-checks it after something unrelated changes —
      here, a pretty-permalinks setting that made the site's REST API
      reachable through a second URL form the original rule never accounted
      for. This is one of the most common gaps in real security operations:
      a mitigation that was correct the day it was written silently stops
      being complete.</p>
      <p><strong>What an attacker actually does, and the tools they'd use:</strong>
      when a direct path is blocked, trying alternate routes to the same
      functionality is a standard move — WAF and filter bypass testing tools
      like <strong>Burp Suite</strong> and dedicated WAF-bypass wordlists
      exist specifically to enumerate alternate encodings, paths, and
      parameter forms that reach the same backend logic a blocked path does.
      For WordPress specifically, knowing that <code>?rest_route=</code> is a
      built-in alias for the entire REST API (it exists for sites that don't
      use pretty permalinks) is exactly the kind of platform-specific detail
      that turns "this looks patched" into "this isn't, actually."</p>
      <p><strong>What prevents this:</strong> mitigations should be verified
      by actually testing the thing they claim to block (hit the endpoint
      both ways and confirm it's rejected), not just by confirming a rule
      was added; and any WAF rule should be re-reviewed whenever related
      configuration changes, not treated as permanently correct once closed.</p>
      <p><strong>Real-world example:</strong> this exact gap — one WAF rule
      covering one URL form of an endpoint while an alias form stays open —
      is drawn directly from the mitigation guidance in Searchlight Cyber's
      <a href="https://slcyber.io/research-center/wp2shell-pre-authentication-rce-in-wordpress-core/" target="_blank" rel="noopener">WP2Shell advisory</a>,
      which explicitly names both URL forms precisely because WordPress's
      REST API has always been reachable either way. Incomplete mitigations
      that miss an alias path or encoding are one of the most common reasons
      a "patched" system turns out not to be, across virtually every WAF
      deployment in production.</p>
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
    recap: `
      <p><strong>How this actually happens:</strong> a developer builds a
      genuinely useful feature — import data from a URL, generate a
      thumbnail from an image link, test a webhook — that fetches
      whatever URL the user supplies, server-side. The bug isn't the
      feature itself, it's the missing check on <em>where</em> that fetch
      is allowed to go. Nobody sets out to let the internet reach their
      cloud provider's internal-only address; it's simply the side effect
      of an unvalidated "fetch this URL" feature running on a machine that
      itself has access to that address.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> exactly what you just did — try pointing the feature
      at an internal-looking address instead of a normal one. For
      confirming a suspected SSRF blind (when there's no visible response
      to read), <strong>Burp Suite Collaborator</strong> is the standard
      tool: it gives you a unique throwaway domain, and if the vulnerable
      server reaches out to it, you know the SSRF is real even without
      seeing the metadata response directly. <strong>SSRFmap</strong> is a
      dedicated open-source tool for automating exploitation once an SSRF
      is confirmed. In the real Capital One case, no special tooling was
      even needed — a misconfigured web application firewall let the
      attacker reach an SSRF-vulnerable internal application directly,
      which was then tricked into querying AWS's instance metadata service
      and handed over real, valid temporary IAM credentials, later used to
      read and exfiltrate data from S3 storage buckets.</p>
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
