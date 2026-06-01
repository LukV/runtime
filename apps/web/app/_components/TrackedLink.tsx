'use client'

import { trackEvent } from '@/lib/plausible'

// A plain anchor that fires a Plausible goal on click, for CTAs that live
// inside server components (which can't carry an onClick themselves). The
// navigation still happens natively — trackEvent() only queues the event.
type TrackedLinkProps = React.ComponentPropsWithoutRef<'a'> & {
  event: string
}

export function TrackedLink({ event, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event)
        onClick?.(e)
      }}
    />
  )
}
