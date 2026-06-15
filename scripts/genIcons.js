// One-off: regenerate small logo + favicons from public/buzz-logo.jpeg
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');
const src = path.join(pub, 'buzz-logo.jpeg');

async function png(size, out, opts = {}) {
  const buf = await sharp(src)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9, ...opts })
    .toBuffer();
  fs.writeFileSync(path.join(pub, out), buf);
  return buf;
}

// Build a multi-image ICO embedding PNG frames (supported by modern browsers).
function buildIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const blobs = [];
  frames.forEach((f, i) => {
    const o = i * 16;
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, o + 0); // width (0 = 256)
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, o + 1); // height
    dir.writeUInt8(0, o + 2); // colors in palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // color planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(f.data.length, o + 8); // size of image data
    dir.writeUInt32LE(offset, o + 12); // offset
    offset += f.data.length;
    blobs.push(f.data);
  });
  return Buffer.concat([header, dir, ...blobs]);
}

(async () => {
  // Header logo, displayed at 80x80 (2x for crispness on retina)
  await png(160, 'buzz-logo-80.png', { quality: 90 });

  // Favicons
  const f16 = await png(16, 'favicon-16x16.png');
  const f32 = await png(32, 'favicon-32x32.png');
  await png(180, 'apple-touch-icon.png', { quality: 90 });

  const ico = buildIco([
    { size: 16, data: f16 },
    { size: 32, data: f32 },
  ]);
  fs.writeFileSync(path.join(pub, 'favicon.ico'), ico);

  for (const f of ['buzz-logo-80.png', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'favicon.ico']) {
    console.log(f, fs.statSync(path.join(pub, f)).size, 'bytes');
  }
})();
