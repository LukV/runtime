import { Ribbon } from './_components/Ribbon'
import { Wordmark } from './_components/Wordmark'

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-16 gap-10">
      <p className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-mist)' }}>
        Block 1 · brand system in code
      </p>

      <Wordmark size="splash" />

      <section className="flex flex-col gap-5 max-w-md w-full">
        <p
          style={{
            color: 'var(--color-inkt)',
            fontSize: '3.25rem',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
          }}
        >
          Tempo. <span style={{ color: 'var(--color-steen)' }}>8 km.</span>
        </p>

        <p style={{ color: 'var(--color-houtskool)', fontSize: '1.0625rem', lineHeight: 1.55 }}>
          Houd het comfortabel zwaar. The wordmark above — <Wordmark size="inline" /> — is now a
          component reading from{' '}
          <code style={{ color: 'var(--color-inkt)' }}>@runtime/design-tokens/wordmark</code>.
        </p>

        <p
          className="uppercase"
          style={{
            color: 'var(--color-mist)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
          }}
        >
          Label caps · Inter Medium · 0.15em
        </p>

        <p
          style={{
            color: 'var(--color-inkt)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: '1.5rem',
            letterSpacing: '-0.04em',
          }}
        >
          12,500m · 4:32 · 184 bpm
        </p>
      </section>

      <div className="flex flex-col items-center gap-3 mt-4">
        <Wordmark size="header" theme="light" />
        <div
          style={{
            background: 'var(--color-inkt)',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.375rem',
          }}
        >
          <Wordmark size="header" theme="dark" />
        </div>
      </div>

      <section className="flex flex-col gap-6 max-w-md w-full mt-4">
        <Ribbon
          currentWeek={1}
          totalWeeks={12}
          caption="Week 1 / 12 · Mechelen over 96 dagen"
        />
        <Ribbon
          currentWeek={6}
          totalWeeks={12}
          caption="Week 6 / 12 · Mechelen over 96 dagen"
        />
        <Ribbon
          currentWeek={12}
          totalWeeks={12}
          caption="Week 12 / 12 · Mechelen over 96 dagen"
        />
        <div style={{ background: 'var(--color-inkt)', padding: '1.25rem', borderRadius: '0.375rem' }}>
          <Ribbon
            currentWeek={4}
            totalWeeks={18}
            caption="Week 4 / 18 · 10 km onder het uur over 47 dagen"
            theme="dark"
          />
        </div>
      </section>

      <div className="flex gap-3 mt-4 flex-wrap justify-center">
        {[
          'veldgroen',
          'eerste-licht',
          'inkt',
          'krijt',
          'mist',
          'stof',
          'nacht',
          'steen',
          'houtskool',
        ].map((name) => (
          <div
            key={name}
            title={name}
            className="w-8 h-8 rounded-full"
            style={{
              background: `var(--color-${name})`,
              border: '1px solid var(--color-mist)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
