import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'My App',
  description: 'A simple Next.js app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="flex gap-6 p-4 bg-white shadow-md">
          <Link href="/" className="hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link href="/login" className="hover:text-blue-600 font-medium">
            Login
          </Link>
          <Link href="/profile" className="hover:text-blue-600 font-medium">
            Profile
          </Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
