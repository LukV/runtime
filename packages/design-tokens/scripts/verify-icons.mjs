#!/usr/bin/env node
// Builds dist/icons/_verify.png — every non-1024 PNG scaled up 4× and laid
// out side-by-side with its size label baked in. Open in Preview and confirm
// the amber dot lands on a pixel boundary at every size — particularly at
// 29×29 where the dot is ~4 pixels and any subpixel smear is visible.

import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = dirname(HERE)
const OUT_DIR = join(PKG, 'dist', 'icons')

const SIZES = [29, 40, 60, 80, 120, 180]
const ZOOM = 4
const PADDING = 16
const LABEL_HEIGHT = 28
const BACKGROUND = '#F6F5F1'
const LABEL_COLOR = '#0D1014'

mkdirSync(OUT_DIR, { recursive: true })

const tiles = await Promise.all(
  SIZES.map(async (size) => {
    const src = join(OUT_DIR, `app-icon-${size}.png`)
    const scaled = await sharp(src)
      .resize(size * ZOOM, size * ZOOM, { kernel: 'nearest' })
      .png()
      .toBuffer()
    return { size, buffer: scaled, width: size * ZOOM, height: size * ZOOM }
  }),
)

const tileWidth = Math.max(...tiles.map((t) => t.width))
const tileSlot = tileWidth + PADDING * 2
const totalWidth = tileSlot * tiles.length
const tileHeight = Math.max(...tiles.map((t) => t.height))
const totalHeight = tileHeight + LABEL_HEIGHT + PADDING * 3

const labels = await Promise.all(
  tiles.map(async (tile, i) => {
    const labelSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSlot}" height="${LABEL_HEIGHT}">
        <text x="${tileSlot / 2}" y="${LABEL_HEIGHT - 8}"
              font-family="Inter, system-ui, sans-serif"
              font-size="14" font-weight="500"
              text-anchor="middle" fill="${LABEL_COLOR}">
          ${tile.size}×${tile.size}
        </text>
      </svg>`,
    )
    return {
      input: labelSvg,
      left: i * tileSlot,
      top: tileHeight + PADDING * 2,
    }
  }),
)

const composites = [
  ...tiles.map((tile, i) => ({
    input: tile.buffer,
    left: i * tileSlot + Math.floor((tileSlot - tile.width) / 2),
    top: PADDING + (tileHeight - tile.height),
  })),
  ...labels,
]

await sharp({
  create: {
    width: totalWidth,
    height: totalHeight,
    channels: 4,
    background: BACKGROUND,
  },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(join(OUT_DIR, '_verify.png'))

console.log(`wrote ${join(OUT_DIR, '_verify.png')} (${totalWidth}×${totalHeight})`)
console.log('Open in Preview at 100%. Check that the amber dot at 29×29 sits on a pixel boundary.')
