#!/usr/bin/env node
// Rasterizes icons/app-icon.svg to PNG at every Apple-required size.
// Writes outputs to dist/icons/app-icon-{size}.png plus a MANIFEST.json
// describing each PNG's intended Assets.xcassets catalog binding so
// block 5's wiring is a five-minute consumer step.
//
// kernel: 'lanczos3' is deliberate — at 29×29 the amber dot is ~4.5px
// diameter and softer downscalers (mitchell, cubic) smear the dot. Don't
// change without re-running verify-icons.mjs.

import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = dirname(HERE)
const SRC = join(PKG, 'icons', 'app-icon.svg')
const OUT = join(PKG, 'dist', 'icons')

// [px, idiom, scale, role] — Apple catalog metadata.
// @1x variants intentionally skipped (no non-Retina iOS device since 2014).
const SIZES = [
  [1024, 'ios-marketing', 1, 'app-store'],
  [180, 'iphone', 3, 'app'],
  [120, 'iphone', 2, 'app'],
  [80, 'iphone', 2, 'spotlight'],
  [60, 'iphone', 3, 'settings'],
  [40, 'iphone', 2, 'spotlight'],
  [29, 'iphone', 2, 'settings'],
]

mkdirSync(OUT, { recursive: true })
const svg = readFileSync(SRC)

// Rasterize the SVG once at 2× the largest output (2048×2048). lanczos3
// downscale from this buffer keeps every PNG sharp without recompiling
// vector geometry per size.
const masterBuffer = await sharp(svg, { density: 144 })
  .resize(2048, 2048, { fit: 'fill' })
  .png()
  .toBuffer()

const manifest = []
for (const [size, idiom, scale, role] of SIZES) {
  const filename = `app-icon-${size}.png`
  await sharp(masterBuffer)
    .resize(size, size, { kernel: 'lanczos3', fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, filename))
  manifest.push({ filename, size, idiom, scale, role })
  console.log(`  ${filename.padEnd(20)} ${size}×${size}  ${idiom}@${scale}x  ${role}`)
}

writeFileSync(
  join(OUT, 'MANIFEST.json'),
  JSON.stringify({ source: 'icons/app-icon.svg', icons: manifest }, null, 2) + '\n',
)

console.log(`\nwrote ${manifest.length} PNGs + MANIFEST.json to ${OUT}`)
