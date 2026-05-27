import { WORDMARK_PATH, WORDMARK_PERIOD, WORDMARK_VIEWBOX } from '@runtime/design-tokens/wordmark'

type Size = 'header' | 'inline' | 'splash'
type Theme = 'light' | 'dark'

// Heights in CSS pixels per 004 §1. `inline` matches body type at 17pt
// for places where the wordmark appears inside body copy.
const HEIGHT: Record<Size, number> = {
  header: 26,
  inline: 17,
  splash: 38,
}

export function Wordmark({
  size = 'header',
  theme = 'light',
  className,
}: {
  size?: Size
  theme?: Theme
  className?: string
}) {
  const color = theme === 'light' ? 'var(--color-inkt)' : 'var(--color-krijt)'
  const height = HEIGHT[size]
  const { x, y, width, height: vbHeight } = WORDMARK_VIEWBOX
  const aspect = width / vbHeight

  return (
    <span
      role="img"
      aria-label="runtime"
      className={className}
      style={{
        color,
        display: 'inline-block',
        height,
        width: height * aspect,
        lineHeight: 0,
        verticalAlign: size === 'inline' ? 'text-bottom' : 'middle',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${x} ${y} ${width} ${vbHeight}`}
        fill="currentColor"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <path d={WORDMARK_PATH} />
        {/* Always Eerste licht. Per 004 §1, the amber never scales or shifts. */}
        <circle
          cx={WORDMARK_PERIOD.cx}
          cy={WORDMARK_PERIOD.cy}
          r={WORDMARK_PERIOD.r}
          fill="var(--color-eerste-licht)"
        />
      </svg>
    </span>
  )
}
