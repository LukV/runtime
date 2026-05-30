import {
  RIBBON_VIEWBOX,
  RIBBON_GEOMETRY,
  ribbonTicks,
} from '@runtime/design-tokens/ribbon'

type Theme = 'light' | 'dark'

// Per 004 §1 the ribbon scales legibly at 6–18 ticks. The component has no
// minimum width enforcement — render it inside a container that's wide
// enough; the parent layout decides the rendered width.
export function Ribbon({
  currentWeek,
  totalWeeks,
  caption,
  theme = 'light',
  className,
}: {
  currentWeek: number
  totalWeeks: number
  caption?: string
  theme?: Theme
  className?: string
}) {
  if (totalWeeks < 6 || totalWeeks > 18) {
    console.warn(`Ribbon: totalWeeks=${totalWeeks} is outside the designed range [6, 18]`)
  }
  if (currentWeek < 1 || currentWeek > totalWeeks) {
    console.warn(`Ribbon: currentWeek=${currentWeek} is outside [1, ${totalWeeks}]`)
  }

  const { ticks, dotX, flagX } = ribbonTicks(totalWeeks, currentWeek)
  const color = theme === 'light' ? 'var(--color-inkt)' : 'var(--color-krijt)'
  const captionColor = theme === 'light' ? 'var(--color-mist)' : 'var(--color-steen)'

  return (
    <div className={className} style={{ color }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${RIBBON_VIEWBOX.width} ${RIBBON_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={caption ?? `Week ${currentWeek} of ${totalWeeks}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <line
          x1={RIBBON_GEOMETRY.padding}
          x2={flagX}
          y1={RIBBON_GEOMETRY.poleY}
          y2={RIBBON_GEOMETRY.poleY}
          stroke="currentColor"
          strokeWidth={RIBBON_GEOMETRY.poleStrokeWidth}
        />
        {ticks
          .filter((t) => !t.isCurrent)
          .map((t, i) => (
            <line
              key={i}
              x1={t.x}
              x2={t.x}
              y1={RIBBON_GEOMETRY.poleY - RIBBON_GEOMETRY.tickHeight / 2}
              y2={RIBBON_GEOMETRY.poleY + RIBBON_GEOMETRY.tickHeight / 2}
              stroke="currentColor"
              strokeWidth={RIBBON_GEOMETRY.poleStrokeWidth}
            />
          ))}
        {/* Always Eerste licht. Per 004 §1 the warmth doesn't scale; the dot
            is locked regardless of theme or tick density. */}
        <circle
          cx={dotX}
          cy={RIBBON_GEOMETRY.poleY}
          r={RIBBON_GEOMETRY.dotRadius}
          fill="var(--color-eerste-licht)"
        />
        {/* Square, not triangle. Per 004 §1 the square plants the goal; a
            triangle would read as directional. The flag is centered on the
            pole's end — the small right-side protrusion is intentional. */}
        <rect
          x={flagX - RIBBON_GEOMETRY.flagSide / 2}
          y={RIBBON_GEOMETRY.poleY - RIBBON_GEOMETRY.flagSide / 2}
          width={RIBBON_GEOMETRY.flagSide}
          height={RIBBON_GEOMETRY.flagSide}
          fill="currentColor"
        />
      </svg>
      {caption && (
        <p
          style={{
            color: captionColor,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.6875rem',
            fontWeight: 500,
            marginTop: 6,
          }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}
