/**
 * Generate clean, minimal app icons for OmvärldsRadar
 *
 * Creates a simple radar-sweep icon on a blue gradient background.
 * Outputs: favicon.ico (32x32), icon.png (192x192), apple-icon.png (180x180)
 *
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SIZE_MASTER = 512;

// Create SVG for a clean radar icon
function createRadarSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38; // Radar circle radius
  const ringGap = r / 3;

  // Sweep line endpoint (at ~60 degrees from top)
  const sweepAngle = -30; // degrees from 12 o'clock
  const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;
  const sx = cx + r * Math.cos(sweepRad);
  const sy = cy + r * Math.sin(sweepRad);

  // Sweep glow arc (from sweep line going back ~90 degrees)
  const glowStartAngle = sweepAngle - 90;
  const glowStartRad = ((glowStartAngle - 90) * Math.PI) / 180;
  const glowStartX = cx + r * Math.cos(glowStartRad);
  const glowStartY = cy + r * Math.sin(glowStartRad);

  // Sweep end point for arc
  const sweepEndRad = ((sweepAngle - 90) * Math.PI) / 180;
  const sweepEndX = cx + r * Math.cos(sweepEndRad);
  const sweepEndY = cy + r * Math.sin(sweepEndRad);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>

    <!-- Sweep gradient (cone/fan) -->
    <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${sweepAngle}, ${cx}, ${cy})">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0"/>
      <stop offset="70%" stop-color="#60a5fa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#93c5fd" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Glow effect -->
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>

    <!-- Dot glow -->
    <radialGradient id="dotglow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="1"/>
      <stop offset="50%" stop-color="#60a5fa" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Rounded background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="url(#bg)"/>

  <!-- Subtle inner glow -->
  <circle cx="${cx}" cy="${cy}" r="${r * 1.2}" fill="url(#glow)"/>

  <!-- Radar rings -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#60a5fa" stroke-opacity="0.25" stroke-width="${size * 0.004}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - ringGap}" fill="none" stroke="#60a5fa" stroke-opacity="0.18" stroke-width="${size * 0.003}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - ringGap * 2}" fill="none" stroke="#60a5fa" stroke-opacity="0.12" stroke-width="${size * 0.003}"/>

  <!-- Cross hairs -->
  <line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="#60a5fa" stroke-opacity="0.12" stroke-width="${size * 0.003}"/>
  <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#60a5fa" stroke-opacity="0.12" stroke-width="${size * 0.003}"/>

  <!-- Sweep fan (pie slice) -->
  <path d="M ${cx} ${cy} L ${glowStartX} ${glowStartY} A ${r} ${r} 0 0 1 ${sweepEndX} ${sweepEndY} Z"
        fill="url(#sweep)" opacity="0.8"/>

  <!-- Sweep line (bright) -->
  <line x1="${cx}" y1="${cy}" x2="${sx}" y2="${sy}"
        stroke="#93c5fd" stroke-width="${size * 0.008}" stroke-linecap="round" opacity="0.9"/>

  <!-- Center dot -->
  <circle cx="${cx}" cy="${cy}" r="${size * 0.022}" fill="#93c5fd"/>
  <circle cx="${cx}" cy="${cy}" r="${size * 0.012}" fill="#e0f2fe"/>

  <!-- Blip dots (detected items on radar) -->
  <circle cx="${cx + r * 0.35}" cy="${cy - r * 0.55}" r="${size * 0.018}" fill="url(#dotglow)" opacity="0.9"/>
  <circle cx="${cx - r * 0.2}" cy="${cy - r * 0.3}" r="${size * 0.013}" fill="url(#dotglow)" opacity="0.7"/>
  <circle cx="${cx + r * 0.6}" cy="${cy - r * 0.15}" r="${size * 0.015}" fill="url(#dotglow)" opacity="0.8"/>
</svg>`;
}

async function main() {
  const svg = createRadarSVG(SIZE_MASTER);
  const svgBuffer = Buffer.from(svg);

  // Generate icon.png (192x192) for web manifest
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(resolve(ROOT, "src/app/icon.png"));
  console.log("✓ icon.png (192x192)");

  // Generate apple-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(resolve(ROOT, "src/app/apple-icon.png"));
  console.log("✓ apple-icon.png (180x180)");

  // Generate favicon as 32x32 PNG
  const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  // Create minimal ICO file (single 32x32 PNG image)
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // ICO type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0); // Width
  icoEntry.writeUInt8(32, 1); // Height
  icoEntry.writeUInt8(0, 2); // Colors (0 = no palette)
  icoEntry.writeUInt8(0, 3); // Reserved
  icoEntry.writeUInt16LE(1, 4); // Color planes
  icoEntry.writeUInt16LE(32, 6); // Bits per pixel
  icoEntry.writeUInt32LE(favicon32.length, 8); // Image size
  icoEntry.writeUInt32LE(22, 12); // Offset (6 header + 16 entry)

  const ico = Buffer.concat([icoHeader, icoEntry, favicon32]);
  writeFileSync(resolve(ROOT, "src/app/favicon.ico"), ico);
  console.log("✓ favicon.ico (32x32)");

  // Also generate a larger version for OG/sharing (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(resolve(ROOT, "public/omvarldsradar-icon.png"));
  console.log("✓ omvarldsradar-icon.png (512x512) for sharing");

  console.log("\nAll icons generated successfully!");
}

main().catch(console.error);
