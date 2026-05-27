import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Inter Variable — self-hosted from rsms/inter canonical build. Single woff2
// covers all weights via the variable axis.
const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
})

// Source Serif 4 Medium — wordmark only. next/font/google self-hosts at build
// time (no runtime requests to Google).
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-wordmark',
  display: 'swap',
})

// JetBrains Mono — numerics. Regular for inline, Medium for emphasis.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'runtime.training',
  description: 'Een trainingsplan dat zich aanpast aan jouw week — en jouw doelwedstrijd.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
