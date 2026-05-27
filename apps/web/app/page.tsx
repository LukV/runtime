export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-10">
      <p className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-mist)' }}>
        Block 1 · brand system in code
      </p>

      <h1
        style={{
          color: 'var(--color-inkt)',
          fontFamily: 'var(--font-wordmark)',
          fontWeight: 500,
          fontSize: '4.5rem',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        runtime<span style={{ color: 'var(--color-eerste-licht)' }}>.</span>
      </h1>

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
          Houd het comfortabel zwaar. Body in Inter Regular at 17pt. The display headline above uses
          Inter Bold with the two-tone treatment from{' '}
          <code style={{ color: 'var(--color-inkt)' }}>004 §1</code>.
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
    </main>
  )
}
