import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/common/Header'

export const metadata: Metadata = {
  title: 'AttendHub - Employee Attendance Management',
  description: 'Modern multi-modal employee attendance management system',
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

