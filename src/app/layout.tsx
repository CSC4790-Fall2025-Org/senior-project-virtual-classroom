import "./globals.css"
import Link from "next/link"

export const metadata = {
  title: "The Virtual Classroom",
  description: "A simple Next.js app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="w-full bg-white shadow-lg py-10 px-16 flex items-center justify-between">
          {/* App Name on the left */}
          <div className="text-6xl font-extrabold tracking-wide">
            The Virtual Classroom
          </div>

          {/* Navigation Links on the right */}
          <div className="flex gap-14 text-3xl">
            <Link href="/" className="hover:text-blue-600 font-semibold">
              Home
            </Link>
            <Link href="/login" className="hover:text-blue-600 font-semibold">
              Login
            </Link>
            <Link href="/profile" className="hover:text-blue-600 font-semibold">
              Profile
            </Link>
          </div>
        </nav>

        <main className="p-12">{children}</main>
      </body>
    </html>
  )
}
