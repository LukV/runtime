// AUTO-GENERATED FROM scripts/generate-ribbon.mjs — DO NOT EDIT.
// The runtime race ribbon as portable geometry. Consumers (Ribbon.tsx and
// the future SwiftUI Ribbon) read these values and assemble the rendering.
//
// Per 004 §1 the dot is always 4–5px (here r=2.5 in viewBox units), the flag
// is a square (not a triangle — squares plant, triangles point), and the
// amber dot is locked to Eerste licht regardless of theme.

export const RIBBON_VIEWBOX = {
  "width": 200,
  "height": 24
} as const

export const RIBBON_GEOMETRY = {
  "dotRadius": 2.5,
  "flagSide": 6,
  "tickHeight": 4,
  "poleStrokeWidth": 1,
  "padding": 8,
  "poleY": 12
} as const

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
