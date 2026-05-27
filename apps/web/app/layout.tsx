import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'runtime.training',
  description: 'Een trainingsplan dat zich aanpast aan jouw week — en jouw doelwedstrijd.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
