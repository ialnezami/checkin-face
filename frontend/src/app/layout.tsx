import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/common/Header'

export const metadata: Metadata = {
  title: 'Employee Check-In System',
  description: 'Multi-modal employee check-in system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

