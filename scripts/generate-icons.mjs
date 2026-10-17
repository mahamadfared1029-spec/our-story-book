import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const chunkCrc = crc32(typeAndData);
  chunk.writeUInt32BE(chunkCrc, 8 + len);
  return chunk;
}

function generatePngBuffer(size, isMaskable = false) {
  // Pure Node.js RGBA buffer generator for Our Story Book Icon
  // Colors:
  // Background: #7C2D37 (124, 45, 55) - Deep Romantic Burgundy
  // Gold accent: #D4AF37 (212, 175, 55)
  // Heart/Page Cream: #FAF7F2 (250, 247, 242)
  // Soft Rose: #E29578 (226, 149, 120)

  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = isMaskable ? 0 : size * 0.22; // rounded squircle for standard, square for maskable

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None (0)
    for (let x = 0; x < width; x++) {
      // Check rounded corner bounding box if not maskable
      let inBounds = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        // Transparent
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // Normalized coordinates -1 to 1 relative to center
      const nx = (x - cx) / (size * 0.38);
      const ny = (y - cy) / (size * 0.38);

      // Book cover background with subtle vignette
      const distFromCenter = Math.sqrt(Math.pow((x - cx) / cx, 2) + Math.pow((y - cy) / cy, 2));
      let r = Math.round(124 - distFromCenter * 20); // 7C
      let g = Math.round(45 - distFromCenter * 15);  // 2D
      let b = Math.round(55 - distFromCenter * 15);  // 37
      r = Math.max(70, Math.min(135, r));
      g = Math.max(25, Math.min(55, g));
      b = Math.max(30, Math.min(65, b));

      // Draw Gold Outer Border (thickness ~ 3% of size)
      const borderThickness = size * 0.035;
      const distToEdgeX = Math.min(x, width - x);
      const distToEdgeY = Math.min(y, height - y);
      const minEdgeDist = Math.min(distToEdgeX, distToEdgeY);
      if (minEdgeDist >= borderThickness * 0.6 && minEdgeDist <= borderThickness * 1.5) {
        // Gold border
        r = 212; g = 175; b = 55;
      }

      // Draw Heart shape in center: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      // Shift slightly up for aesthetic balance
      const hx = nx;
      const hy = -(ny + 0.1); // invert Y and shift
      const hEq = Math.pow(hx * hx + hy * hy - 0.7, 3) - (hx * hx * Math.pow(hy, 3));

      if (hEq <= 0) {
        // Inside heart: warm cream/soft rose with subtle gradient
        const heartDist = Math.sqrt(hx * hx + hy * hy);
        r = Math.round(250 - heartDist * 20);
        g = Math.round(247 - heartDist * 40);
        b = Math.round(242 - heartDist * 50);
      } else if (hEq < 0.15) {
        // Heart outline (gold/rose shimmer)
        r = 212; g = 175; b = 55;
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = 255; // Alpha
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // Color type 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace (none)
  const ihdrChunk = createChunk("IHDR", ihdrData);

  // IDAT Chunk (zlib compressed)
  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk("IDAT", compressedData);

  // IEND Chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("Generating icons...");
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), generatePngBuffer(192, false));
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), generatePngBuffer(512, false));
fs.writeFileSync(path.join(iconsDir, "icon-512-maskable.png"), generatePngBuffer(512, true));

// Also generate scalable SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8F3440"/>
      <stop offset="100%" stop-color="#60202A"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2D175"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#AA8214"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGradient)"/>
  
  <!-- Outer Gold Decorative Border -->
  <rect x="24" y="24" width="464" height="464" rx="92" fill="none" stroke="url(#goldGradient)" stroke-width="6" opacity="0.85"/>
  <rect x="36" y="36" width="440" height="440" rx="80" fill="none" stroke="url(#goldGradient)" stroke-width="2" stroke-dasharray="8 8" opacity="0.6"/>

  <!-- Centered Book & Heart Motif -->
  <g filter="url(#shadow)" transform="translate(0, -10)">
    <!-- Open Book Pages (Left & Right) -->
    <path d="M256 360 C 220 340, 160 340, 100 360 L 100 200 C 160 180, 220 180, 256 200 Z" fill="#FAF7F2" opacity="0.95"/>
    <path d="M256 360 C 292 340, 352 340, 412 360 L 412 200 C 352 180, 292 180, 256 200 Z" fill="#F4EEE4" opacity="0.95"/>
    
    <!-- Book Spine -->
    <line x1="256" y1="195" x2="256" y2="365" stroke="#C29553" stroke-width="4"/>

    <!-- Floating Heart Above Book -->
    <path d="M256 160 C 256 160, 210 110, 170 140 C 130 170, 140 220, 256 280 C 372 220, 382 170, 342 140 C 302 110, 256 160, 256 160 Z" 
          fill="url(#goldGradient)"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgContent);
console.log("All icons created successfully in public/icons/");
