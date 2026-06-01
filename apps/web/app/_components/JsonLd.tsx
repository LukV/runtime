// Inlines a JSON-LD block as a <script type="application/ld+json">. React
// requires dangerouslySetInnerHTML for raw <script> bodies — the content is a
// JSON string literal, not interpreted markup, and JSON.stringify handles
// escaping, so there's no injection surface here.
//
// Per-page schemas (SportsEvent for races, Article for explainers) reuse this
// same component with their own `data`.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
