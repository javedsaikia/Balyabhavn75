import type React from "react"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} antialiased`}>
      <body className="bg-black text-white font-sans min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'Diamond Anniversary - 75 Years of Excellence',
  description: 'Celebrate 75 years of excellence with our Diamond Anniversary events and celebrations.',
  generator: 'v0.app'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
