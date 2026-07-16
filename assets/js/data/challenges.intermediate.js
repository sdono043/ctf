export const intermediateChallenges = [
  {
    id: "int-web-1",
    tier: "intermediate",
    category: "web",
    title: "Employee of the Month",
    points: 150,
    summary: "The directory only links to two profiles. Are there others?",
    prompt: `
      <p>This employee directory only shows links to two profiles, but the
      page fetches profile data by an ID passed in the URL
      (<code>?user=1</code>, <code>?user=2</code>). That's a common pattern
      called an <strong>Insecure Direct Object Reference (IDOR)</strong> — if
      the app doesn't check whether you're <em>allowed</em> to view an ID, any
      ID you can guess or discover works.</p>
      <p>Use the "Open challenge directly" link to view this page in its own
      tab, then read its page source to see how profiles are looked up. Are
      all valid IDs necessarily the small sequential ones you see linked?</p>
    `,
    embed: { type: "iframe", src: "challenges/int-web-1/index.html", height: 340, sandbox: "allow-scripts allow-forms" },
    hints: [
      { text: "View the page's source and find the JavaScript object that stores every profile by ID.", cost: 15 },
      { text: "One entry has a very different, non-sequential ID compared to the others.", cost: 15 },
      { text: "Once you find that ID, edit the ?user= parameter in the address bar to load it directly.", cost: 20 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "bdf5e80821400f27ea370bf2291f8c7682ad2a2a37a003524d520998331495f5",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    debrief: `
      <p><strong>How this actually happens:</strong> a developer builds an
      endpoint that looks up a record by ID — simple, fast, easy to debug —
      and either assumes "you'd have to guess the ID" is protection enough,
      or adds a login check but forgets that being logged in isn't the same
      as being <em>allowed to see this specific record</em>. The UI only
      links to IDs the user should see, so it looks safe — but the server
      itself never actually checks who's asking.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> the standard tool here is <strong>Burp Suite</strong>
      (or its free alternative, <strong>OWASP ZAP</strong>) — a proxy that
      intercepts every request a web app makes, so an attacker can take one
      legitimate request and resend it hundreds of times with different ID
      values automatically (Burp's "Intruder" feature is built exactly for
      this). Command-line fuzzers like <strong>ffuf</strong> do the same
      job from a terminal. Point either at an ID parameter, let it run
      through a range of numbers, and see which ones return someone else's
      data.</p>
      <p><strong>What prevents this:</strong> the server must verify, on
      every request, that the authenticated user is specifically
      authorized for the object ID being requested — authentication
      ("are you logged in") is not the same check as authorization ("are
      you allowed to see this specific record").</p>
      <p><strong>Real-world example:</strong> tracked as
      <a href="https://cwe.mitre.org/data/definitions/639.html" target="_blank" rel="noopener">CWE-639</a>
      and #1 on the <a href="https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/" target="_blank" rel="noopener">OWASP API Security Top 10</a>
      (Broken Object Level Authorization).
      <a href="https://nvd.nist.gov/vuln/detail/CVE-2023-4836" target="_blank" rel="noopener">CVE-2023-4836</a>
      is a recent instance in a WordPress plugin; First American Title's
      2019 breach of over 800 million real-estate documents (Social
      Security numbers, mortgage records) came from this exact class of
      flaw in a production application.</p>
    `,
  },
  {
    id: "int-crypto-1",
    tier: "intermediate",
    category: "crypto",
    title: "Onion Layers",
    points: 150,
    summary: "This ciphertext has been encoded more than once.",
    prompt: `
      <p>Ciphertext:</p>
      <p><code>cEdSQnAZXllkYkFQSUBkQXIYXVJLUGRMc30fTGdtHlJnbR5eZW5NU2duRkJnR3tdc0QaFw==</code></p>
      <p>This has been through multiple encoding steps. The <code>==</code> at
      the end and the character set are a strong hint that the outermost
      layer is Base64. What's underneath might not be text at all — try
      brute-forcing a single-byte XOR key on what you get after decoding.</p>
    `,
    tool: { type: "multi-decoder", initialInput: "cEdSQnAZXllkYkFQSUBkQXIYXVJLUGRMc30fTGdtHlJnbR5eZW5NU2duRkJnR3tdc0QaFw==" },
    hints: [
      { text: "Start with \"Base64 decode\" on the ciphertext as given.", cost: 20 },
      { text: "The result isn't readable yet — it's been XORed with a single repeating byte. Try \"Brute-force XOR\".", cost: 20 },
      { text: "The brute-force output that scores highest for printable characters will itself look like Base64 again — decode it once more.", cost: 25 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "ec37ae48b3a3f93a9cee064587c010be68bbc0f5794f2c3d92d5eb0a9dd2801c",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    debrief: `
      <p><strong>How this actually happens:</strong> a developer, or a
      malware author, wants to hide data from casual inspection without
      the overhead of real cryptography, and single-byte XOR is the
      easiest thing to reach for — a few lines of code, and the output no
      longer looks like plain text. The mistake is assuming "no longer
      readable at a glance" means "secure," when the keyspace is only 256
      possible values.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> exactly what you just did — brute-force all 256 keys
      and look for which one turns into readable text or, as here, valid
      Base64. <strong>CyberChef</strong> has a "XOR Brute Force" recipe
      built in for exactly this. Malware analysts use a purpose-built tool
      called <strong>FLOSS</strong> (FLARE Obfuscated String Solver, from
      Mandiant/Google) to automatically extract and decode obfuscated
      strings — including XOR-encoded ones — straight out of a malware
      sample, without a human trying keys by hand at all.</p>
      <p><strong>What prevents this:</strong> nothing stops an attacker
      from using XOR obfuscation, but defenders should never mistake it
      for encryption — layered encoding without real cryptographic
      strength is a speed bump, not a lock.</p>
      <p><strong>Real-world example:</strong> single- and multi-byte XOR
      "encryption" shows up constantly in real malware analysis — banking
      trojans and droppers such as Emotet and Qakbot have used exactly
      this technique to obfuscate their configuration data and
      command-and-control strings, and analysts break it the same way you
      just did: brute-force the key space and look for what turns
      printable.</p>
    `,
  },
  {
    id: "int-forensics-1",
    tier: "intermediate",
    category: "forensics",
    title: "Whispers in the Pixels",
    points: 150,
    summary: "This image looks completely ordinary. It isn't.",
    prompt: `
      <p>Steganography hides data inside the least-significant bits of an
      image's pixels — changes so small the picture looks unchanged to the
      eye, but a byte-level read reveals a hidden message.</p>
      <p>Use the LSB extractor tool below on the image to pull out whatever
      is encoded in it.</p>
    `,
    assets: [{ type: "image", path: "assets/img/stego/int-forensics-1.png", label: "int-forensics-1.png" }],
    tool: { type: "lsb", imageUrl: "assets/img/stego/int-forensics-1.png" },
    hints: [
      { text: "The message is hidden in the red, green, and blue channels of each pixel — one bit at a time.", cost: 20 },
      { text: "Click \"Extract LSB data\" — the tool already knows how to walk the channels in the right order.", cost: 15 },
      { text: "A 32-bit header at the very start of the hidden data tells the tool how many bytes of message follow.", cost: 15 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "9ceef50fa9c098d4204ba95e24786568e7021936f01727587da95b2237eb408b",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    debrief: `
      <p><strong>How this actually happens:</strong> unlike most of the
      other bugs in this course, this one is rarely an accident — LSB
      steganography is a deliberate technique. It's legitimate when used
      for watermarking or proving image ownership, and malicious when used
      to smuggle stolen data out of a network, or hide malware
      configuration inside a file that looks completely ordinary to a
      human and to most automated scanners, since the pixel changes are
      visually undetectable.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> to hide data, tools like <strong>steghide</strong> or
      <strong>OpenStego</strong> automate exactly what our LSB tool does in
      reverse. To detect it — which is what you just did — the standard
      open-source tool is <strong>zsteg</strong>, built specifically to
      find hidden data in PNG and BMP files by checking exactly the kind
      of bit-plane patterns you just extracted by hand;
      <strong>binwalk</strong> is the more general-purpose version, useful
      for spotting embedded/appended content of any kind, not just LSB
      stego.</p>
      <p><strong>What prevents this:</strong> organizations handling
      sensitive data at a serious threat level use dedicated
      steganalysis tooling and treat unexplained image traffic (unusual
      volume, unusual destinations) as worth inspecting.</p>
      <p><strong>Real-world example:</strong> this isn't just a CTF
      trick — real malware families including Duqu, Zeus/Zbot, and
      Gatak/Stegoloader have all exfiltrated stolen data or hidden their
      configuration by embedding it in ordinary-looking image files,
      specifically to slip past filters that only inspect what an image
      renders as.</p>
    `,
  },
  {
    id: "int-osint-1",
    tier: "intermediate",
    category: "osint",
    title: "Geotagged",
    points: 150,
    summary: "A photo can reveal exactly where it was taken.",
    prompt: `
      <p>Photos often carry embedded metadata (EXIF) recording things like the
      camera used — and sometimes GPS coordinates of where they were taken.
      Extract the GPS data from the image below, then cross-reference the
      coordinates against the offline landmark field guide to identify the
      location.</p>
      <p><a href="assets/data/osint/int-osint-1-fieldguide.json" download>Download the landmark field guide (JSON)</a></p>
    `,
    assets: [
      { type: "image", path: "assets/img/osint/int-osint-1.png", label: "int-osint-1.png" },
      { type: "data", path: "assets/data/osint/int-osint-1-fieldguide.json", label: "Landmark field guide" },
    ],
    tool: { type: "exif", imageUrl: "assets/img/osint/int-osint-1.png" },
    hints: [
      { text: "Click \"Read EXIF/GPS data\" to pull the latitude and longitude out of the image.", cost: 20 },
      { text: "Open the field guide JSON and find the landmark whose lat_range/lon_range contains your coordinates.", cost: 15 },
      { text: "That landmark's field_note holds the flag directly.", cost: 15 },
    ],
    flag: {
      algorithm: "SHA-256",
      hash: "d83c6270b1e7d9c4a3f801abf4f8209ddbcafd5f412082de4dbf3aef6cc7a783",
      normalize: { trim: true, lowercase: false },
      formatHint: "flag{...}",
    },
    debrief: `
      <p><strong>How this actually happens:</strong> phones and cameras
      embed GPS coordinates into a photo's metadata automatically whenever
      location services are on — most people's habit is to just take the
      photo and share it, with no separate step where they'd notice or
      remove that data. Unlike a caption, EXIF metadata isn't visible in
      the photo itself, so nothing about looking at the image tips anyone
      off that a precise location is riding along inside the file.</p>
      <p><strong>What an attacker actually does, and the tools they'd
      use:</strong> the standard tool is <strong>ExifTool</strong>, a free
      command-line utility that reads (and writes) metadata from
      practically any image or document format — one command against a
      downloaded photo prints every embedded GPS coordinate, camera model,
      and timestamp. There's no cleverness required beyond downloading the
      photo and running the tool; the same read our in-page EXIF tool just
      did for you.</p>
      <p><strong>What prevents this:</strong> stripping EXIF metadata
      before publishing images publicly (most major social platforms do
      this automatically now, but internal tools, personal accounts, and
      press/marketing photos often don't); awareness training on checking
      before posting is exactly this kind of exercise.</p>
      <p><strong>Real-world example:</strong> in 2012, journalists
      photographing fugitive John McAfee published a photo of him with
      GPS EXIF data intact — internet sleuths pinpointed his exact
      location in Guatemala within hours, and he was arrested the next
      day. The same pattern has been documented in domestic-violence
      stalking cases and in exposing activists to hostile governments.</p>
    `,
  },
];
