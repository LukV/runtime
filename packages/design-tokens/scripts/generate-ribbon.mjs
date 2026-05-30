#!/usr/bin/env node
// Emits dist/ribbon.ts — the geometry constants and helper for the runtime
// race ribbon (004 §1 "The hook"). Parametric on totalWeeks/currentWeek; the
// generator owns the shape so the web and (future) iOS components both read
// the same source.
//
// Pattern mirrors generate-wordmark.mjs: pre-computed shape, exported as a
// platform-portable TS module. The React component imports these constants
// and assembles the JSX itself.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = dirname(HERE)
const OUT_TS = join(PKG, 'dist', 'ribbon.ts')

const VIEWBOX = { width: 200, height: 24 }
const GEOMETRY = {
  dotRadius: 2.5,
  flagSide: 6,
  tickHeight: 4,
  poleStrokeWidth: 1,
  padding: 8,
  poleY: 12,
}

const ts = `// AUTO-GENERATED FROM scripts/generate-ribbon.mjs — DO NOT EDIT.
// The runtime race ribbon as portable geometry. Consumers (Ribbon.tsx and
// the future SwiftUI Ribbon) read these values and assemble the rendering.
//
// Per 004 §1 the dot is always 4–5px (here r=2.5 in viewBox units), the flag
// is a square (not a triangle — squares plant, triangles point), and the
// amber dot is locked to Eerste licht regardless of theme.

export const RIBBON_VIEWBOX = ${JSON.stringify(VIEWBOX, null, 2)} as const

export const RIBBON_GEOMETRY = ${JSON.stringify(GEOMETRY, null, 2)} as const

export interface RibbonTick {
  x: number
  isCurrent: boolean
}

export interface RibbonTicks {
  ticks: RibbonTick[]
  dotX: number
  flagX: number
}

export function ribbonTicks(totalWeeks: number, currentWeek: number): RibbonTicks {
  const { padding } = RIBBON_GEOMETRY
  const usableWidth = RIBBON_VIEWBOX.width - padding * 2
  const tickStep = totalWeeks > 1 ? usableWidth / (totalWeeks - 1) : 0

  const ticks: RibbonTick[] = []
  for (let i = 0; i < totalWeeks; i++) {
    ticks.push({
      x: padding + i * tickStep,
      isCurrent: i + 1 === currentWeek,
    })
  }

  const dotX = padding + (currentWeek - 1) * tickStep
  const flagX = padding + usableWidth

  return { ticks, dotX, flagX }
}
`

mkdirSync(dirname(OUT_TS), { recursive: true })
writeFileSync(OUT_TS, ts)

console.log(`wrote ${OUT_TS}`)
console.log(`  viewBox: ${VIEWBOX.width}×${VIEWBOX.height}`)
console.log(`  dot radius: ${GEOMETRY.dotRadius}, flag side: ${GEOMETRY.flagSide}`)
