import "./globals.css"
import Link from "next/link"
import Image from "next/image"
import logo from "./logo.png"

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
        <nav className="w-full bg-[#183024] shadow-lg px-16 flex items-center justify-between">
          {/* App Name on the left */}
          <div className="text-3xl font-bold text-gray-800 flex items-center">
            <Image
              src={logo}
              alt="App Logo"
              className="h-40 w-40 inline-block mr-3"
            />
          </div>

          {/* Navigation Links on the right */}
          <div className="flex gap-14 text-3xl text-[#F3F3ED]">
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

        <main className="py-1">{children}</main>
      </body>
    </html>
  )
}
