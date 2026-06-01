import Script from 'next/script'

// Privacy-friendly analytics by Plausible — EU-hosted, cookieless, no personal
// data (what the /privacy page promises). The init stub queues any
// plausible(...) calls so custom CTA events still fire if they happen before
// the main script finishes loading.
//
// Gated to production so `npm run dev` traffic never reaches the dashboard.
// (Push-to-main is a prod deploy on the real domain, so this is simply "live
// site on, local off". Revisit if per-PR preview deploys are ever added —
// those run with NODE_ENV=production too.)
export function Plausible() {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Script
        src="https://plausible.io/js/pa-ipbLXTxCbQTANpaJIX7RC.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </>
  )
}
