import { Metadata } from 'next'

import 'tailwindcss/tailwind.css'
import '../public/fonts/hack.css'
import './styles.css'

export const metadata: Metadata = {
  title: 'Robot Karol Online',
  description:
    'Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <h1 style={{ display: 'none' }}>Robot Karol Online</h1>
        {children}
      </body>
    </html>
  )
}
