import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NBCC Student Services Navigator',
  description: 'Concept demonstrator for NBCC Student Services information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="disclaimer-banner">
          <div className="disclaimer-content">
            <strong>Lucentrix concept demonstration using public NBCC information.</strong>
            <span>Not an official NBCC service. Do not enter personal or confidential information.</span>
          </div>
        </div>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
