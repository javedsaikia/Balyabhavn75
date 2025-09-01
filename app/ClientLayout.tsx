"use client"

import type React from "react"
import AnimatedBackground from "@/components/animated-background"
import { useEffect } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      const errorString = error?.toString() || error?.message || String(error)

      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask") ||
        errorString.startsWith("s:") ||
        (error && error.message && error.message.includes("MetaMask"))
      ) {
        console.warn("[v0] Suppressing external MetaMask error:", errorString)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      const errorString = error?.toString() || String(error)

      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask") ||
        errorString.startsWith("s:")
      ) {
        console.warn("[v0] Suppressing external MetaMask error:", errorString)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection, true)
    window.addEventListener("error", handleError, true)

    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const errorString = args.join(" ")
      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask")
      ) {
        console.warn("[v0] Suppressed MetaMask console error:", ...args)
        return
      }
      originalConsoleError.apply(console, args)
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
      window.removeEventListener("error", handleError, true)
      console.error = originalConsoleError
    }
  }, [])

  return (
    <body className="bg-black text-white font-sans min-h-screen">
      <AnimatedBackground />
      {children}
    </body>
  )
}
