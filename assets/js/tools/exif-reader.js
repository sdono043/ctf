// Minimal EXIF/TIFF IFD parser, reading GPS tags out of a PNG "eXIf" chunk
// (the official PNG chunk for embedding a raw EXIF/TIFF blob — same binary
// IFD structure a JPEG's APP1 segment would carry).

function findPngChunk(bytes, type) {
  let offset = 8; // past the 8-byte PNG signature
  while (offset < bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
    const chunkType = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (chunkType === type) {
      return bytes.slice(offset + 8, offset + 8 + length);
    }
    offset += 8 + length + 4; // length + type + data + crc
  }
  return null;
}

function rationalToNumber(view, pos, littleEndian) {
  const num = view.getUint32(pos, littleEndian);
  const den = view.getUint32(pos + 4, littleEndian);
  return den === 0 ? 0 : num / den;
}

function parseGpsIfd(view, ifdOffset, littleEndian, tiffStart) {
  const count = view.getUint16(ifdOffset, littleEndian);
  const gps = {};
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const valueOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);

    if (tag === 0x0001) gps.latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    else if (tag === 0x0003) gps.lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    else if (tag === 0x0002 && type === 5) {
      gps.lat = [0, 1, 2].map((k) => rationalToNumber(view, valueOffset + k * 8, littleEndian));
    } else if (tag === 0x0004 && type === 5) {
      gps.lon = [0, 1, 2].map((k) => rationalToNumber(view, valueOffset + k * 8, littleEndian));
    }
  }
  return gps;
}

export async function readGpsFromPng(url) {
  const res = await fetch(url);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const exif = findPngChunk(bytes, "eXIf");
  if (!exif) return null;

  const view = new DataView(exif.buffer, exif.byteOffset, exif.byteLength);
  const littleEndian = view.getUint16(0) === 0x4949;
  const ifd0Offset = view.getUint32(4, littleEndian);

  const ifd0Count = view.getUint16(ifd0Offset, littleEndian);
  let gpsIfdOffset = null;
  for (let i = 0; i < ifd0Count; i++) {
    const entryOffset = ifd0Offset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag === 0x8825) gpsIfdOffset = view.getUint32(entryOffset + 8, littleEndian);
  }
  if (gpsIfdOffset == null) return null;

  const gps = parseGpsIfd(view, gpsIfdOffset, littleEndian, 0);
  if (!gps.lat || !gps.lon) return null;

  const toDecimal = ([d, m, s], ref) => {
    let val = d + m / 60 + s / 3600;
    if (ref === "S" || ref === "W") val *= -1;
    return val;
  };
  return {
    latitude: toDecimal(gps.lat, gps.latRef),
    longitude: toDecimal(gps.lon, gps.lonRef),
  };
}

export function mountExifTool(container, imageUrl) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "tool-panel";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Read EXIF/GPS data";

  const output = document.createElement("pre");
  output.className = "tool-output";

  btn.addEventListener("click", async () => {
    output.textContent = "Reading...";
    const gps = await readGpsFromPng(imageUrl);
    output.textContent = gps
      ? `GPS coordinates found:\nLatitude:  ${gps.latitude.toFixed(4)}\nLongitude: ${gps.longitude.toFixed(4)}`
      : "No GPS EXIF data found in this image.";
  });

  wrap.append(btn, output);
  container.append(wrap);
}
