export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
      <p className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-mist)' }}>
        Block 1 · brand system in code
      </p>

      <h1 className="text-6xl font-bold" style={{ color: 'var(--color-inkt)' }}>
        runtime<span style={{ color: 'var(--color-eerste-licht)' }}>.</span>
      </h1>

      <p className="max-w-md text-base" style={{ color: 'var(--color-houtskool)' }}>
        Tokens loaded from{' '}
        <code style={{ color: 'var(--color-inkt)' }}>@runtime/design-tokens</code>. Fonts and the
        proper wordmark land in the next two pitches.
      </p>

      <div className="flex gap-3 mt-4">
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
