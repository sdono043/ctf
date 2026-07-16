// Extracts a message hidden in the least-significant bit of each pixel
// channel via <canvas> getImageData. Wire format: first 32 bits (across the
// first pixel channels) encode the message byte-length, then the message
// bytes follow, 8 bits each, one bit per channel.

export function mountLsbDecoder(container, imageUrl) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  const canvas = document.createElement("canvas");
  canvas.style.display = "none";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Extract LSB data";

  const output = document.createElement("pre");
  output.className = "tool-output";

  btn.addEventListener("click", () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let bitIndex = 0;
    function nextBit() {
      // walk R,G,B channels in order, skipping alpha (every 4th byte)
      const pixelChannel = bitIndex;
      const channelPos = pixelChannel + Math.floor(pixelChannel / 3); // skip alpha byte per pixel
      bitIndex++;
      return data[channelPos] & 1;
    }

    let lengthBits = "";
    for (let i = 0; i < 32; i++) lengthBits += nextBit();
    const byteLength = parseInt(lengthBits, 2);

    if (!Number.isFinite(byteLength) || byteLength < 0 || byteLength > 100000) {
      output.textContent = "No valid hidden message found in this image.";
      return;
    }

    let message = "";
    for (let b = 0; b < byteLength; b++) {
      let byteBits = "";
      for (let i = 0; i < 8; i++) byteBits += nextBit();
      message += String.fromCharCode(parseInt(byteBits, 2));
    }
    output.textContent = message;
  });

  wrap.append(img, canvas, btn, output);
  container.append(wrap);
}
