import { ImageResponse } from 'next/og'
import {
  WORDMARK_PATH,
  WORDMARK_PERIOD,
  WORDMARK_VIEWBOX,
} from '@runtime/design-tokens/wordmark'

// Static OG card, generated at build time by next/og (Satori) — no runtime
// cost, no @vercel/og deploy dependency. The Twitter card resolves to this same
// image by default unless a twitter-image.tsx sits alongside.
//
// Colors are hardcoded hex rather than tokens because Satori resolves no CSS
// variables — there's no DOM here. They mirror the locked values in
// packages/design-tokens/tokens.json — Inkt #0D1014, Krijt #F6F5F1,
// Eerste-licht #E8A65A. If a token color changes, regenerate.
export const alt = 'runtime.training'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INKT = '#0D1014'
const KRIJT = '#F6F5F1'
const EERSTE_LICHT = '#E8A65A'

export default function OpengraphImage() {
  const { x, y, width, height } = WORDMARK_VIEWBOX
  const aspect = width / height
  const wordmarkHeight = 140
  const wordmarkWidth = Math.round(wordmarkHeight * aspect)

  // The wordmark as a standalone SVG, embedded as a data URI. Satori renders an
  // <img> with an SVG source reliably, where inline <path> support is partial.
  const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}"><path d="${WORDMARK_PATH}" fill="${KRIJT}"/><circle cx="${WORDMARK_PERIOD.cx}" cy="${WORDMARK_PERIOD.cy}" r="${WORDMARK_PERIOD.r}" fill="${EERSTE_LICHT}"/></svg>`
  const wordmarkSrc = `data:image/svg+xml,${encodeURIComponent(wordmarkSvg)}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: INKT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={wordmarkSrc} width={wordmarkWidth} height={wordmarkHeight} alt="runtime.training" />
      </div>
    ),
    size,
  )
}
