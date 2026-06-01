// Typed wrapper around the global Plausible queue installed in
// app/_components/Plausible.tsx. Calls no-op until the script has loaded — and
// the script is gated to production — so trackEvent() is safe to call from any
// client component without guarding.

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return
  window.plausible?.(name, props ? { props } : undefined)
}

// Goal names live here so call sites read clearly and the strings stay
// identical to what's configured as goals in the Plausible dashboard.
export const PlausibleEvents = {
  downloadApp: 'CTA: Download de app',
  meebouwenEmail: 'CTA: Meebouwen e-mail',
} as const
