#!/usr/bin/env node
// Reads tokens.json and writes dist/tokens.css, dist/tokens.ts, dist/Tokens.swift.
// Pure Node, no deps. Idempotent — re-running with an unchanged tokens.json
// produces byte-identical output.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = dirname(HERE)
const SRC = join(PKG, 'tokens.json')
const OUT = join(PKG, 'dist')

const HEADER_CSS = '/* AUTO-GENERATED FROM tokens.json — DO NOT EDIT */\n\n'
const HEADER_TS = '// AUTO-GENERATED FROM tokens.json — DO NOT EDIT\n\n'
const HEADER_SWIFT = '// AUTO-GENERATED FROM tokens.json — DO NOT EDIT\n\n'

const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

const tokens = JSON.parse(readFileSync(SRC, 'utf8'))

mkdirSync(OUT, { recursive: true })

// ---------- tokens.css ----------
{
  const lines = [':root {']
  for (const [name, hex] of Object.entries(tokens.color)) {
    lines.push(`  --color-${name}: ${hex};`)
  }
  lines.push('')
  for (const [step, px] of Object.entries(tokens.spacing)) {
    lines.push(`  --space-${step}: ${px}px;`)
  }
  lines.push('')
  lines.push(`  --motion-transition: ${tokens.motion.transition};`)
  lines.push('}')
  writeFileSync(join(OUT, 'tokens.css'), HEADER_CSS + lines.join('\n') + '\n')
}

// ---------- tokens.ts ----------
// Type tokens are too compound for CSS variables — exported as a typed object
// for Tailwind / CSS-in-JS consumers. Colors and spacing duplicated as values
// so TS consumers don't have to read the CSS file.
{
  const lines = []
  lines.push(`export const color = ${JSON.stringify(tokens.color, null, 2)} as const`)
  lines.push('')
  lines.push(`export const spacing = ${JSON.stringify(tokens.spacing, null, 2)} as const`)
  lines.push('')
  lines.push(`export const type = ${JSON.stringify(tokens.type, null, 2)} as const`)
  lines.push('')
  lines.push(`export const motion = ${JSON.stringify(tokens.motion, null, 2)} as const`)
  lines.push('')
  lines.push('export type ColorName = keyof typeof color')
  lines.push('export type SpacingStep = keyof typeof spacing')
  lines.push('export type TypeRole = keyof typeof type')
  writeFileSync(join(OUT, 'tokens.ts'), HEADER_TS + lines.join('\n') + '\n')
}

// ---------- Tokens.swift ----------
{
  const hexToInt = (h) => '0x' + h.replace('#', '').toUpperCase()

  const lines = []
  lines.push('import SwiftUI')
  lines.push('')
  lines.push('extension Color {')
  lines.push('  init(hex: UInt32, alpha: Double = 1.0) {')
  lines.push('    let r = Double((hex >> 16) & 0xff) / 255')
  lines.push('    let g = Double((hex >> 8) & 0xff) / 255')
  lines.push('    let b = Double(hex & 0xff) / 255')
  lines.push('    self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push('extension Color {')
  const maxName = Math.max(...Object.keys(tokens.color).map((n) => kebabToCamel(n).length))
  for (const [name, hex] of Object.entries(tokens.color)) {
    const camel = kebabToCamel(name).padEnd(maxName)
    lines.push(`  static let ${camel} = Color(hex: ${hexToInt(hex)})`)
  }
  lines.push('}')
  lines.push('')
  lines.push('enum Spacing {')
  for (const [step, px] of Object.entries(tokens.spacing)) {
    lines.push(`  static let s${step}: CGFloat = ${px}`)
  }
  lines.push('}')
  lines.push('')
  lines.push('enum Motion {')
  // Parse "220ms ease-out" → Animation.easeOut(duration: 0.22)
  const m = tokens.motion.transition.match(/^(\d+)ms\s+(\S+)$/)
  if (!m) throw new Error(`Cannot parse motion.transition: ${tokens.motion.transition}`)
  const seconds = (Number(m[1]) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  const easing = {
    'ease-out': 'easeOut',
    'ease-in': 'easeIn',
    'ease-in-out': 'easeInOut',
    linear: 'linear',
  }[m[2]]
  if (!easing) throw new Error(`Unknown easing: ${m[2]}`)
  lines.push(`  static let transition = Animation.${easing}(duration: ${seconds})`)
  lines.push('}')
  writeFileSync(join(OUT, 'Tokens.swift'), HEADER_SWIFT + lines.join('\n') + '\n')
}

console.log('generated:')
console.log('  dist/tokens.css')
console.log('  dist/tokens.ts')
console.log('  dist/Tokens.swift')
