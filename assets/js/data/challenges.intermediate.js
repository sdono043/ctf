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
  },
];
