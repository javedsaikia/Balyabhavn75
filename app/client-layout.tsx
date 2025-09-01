"use client"

import type React from "react"
import { useEffect, lazy, Suspense } from "react"

const AnimatedBackground = lazy(() => import("@/components/animated-background"))

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
        event.stopImmediatePropagation()
        // Mark as handled to prevent console logging
        Object.defineProperty(event, "defaultPrevented", { value: true, writable: false })
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
        event.stopImmediatePropagation()
        return false
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection, { capture: true, passive: false })
    window.addEventListener("unhandledrejection", handleUnhandledRejection, { capture: false, passive: false })
    window.addEventListener("error", handleError, { capture: true, passive: false })
    window.addEventListener("error", handleError, { capture: false, passive: false })
    document.addEventListener("error", handleError, { capture: true, passive: false })

    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log

    console.error = (...args: any[]) => {
      const errorString = args.join(" ")
      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask") ||
        errorString.includes("Unhandled promise rejection: s:")
      ) {
        return // Completely suppress MetaMask errors
      }
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const errorString = args.join(" ")
      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask")
      ) {
        return // Completely suppress MetaMask warnings
      }
      originalConsoleWarn.apply(console, args)
    }

    const originalOnUnhandledRejection = window.onunhandledrejection
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      const errorString = error?.toString() || error?.message || String(error)

      if (
        errorString.includes("MetaMask") ||
        errorString.includes("Failed to connect to MetaMask") ||
        errorString.includes("s: Failed to connect to MetaMask") ||
        errorString.startsWith("s:")
      ) {
        event.preventDefault()
        return false
      }

      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(window, event)
      }
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, { capture: true })
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, { capture: false })
      window.removeEventListener("error", handleError, { capture: true })
      window.removeEventListener("error", handleError, { capture: false })
      document.removeEventListener("error", handleError, { capture: true })
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
      window.onunhandledrejection = originalOnUnhandledRejection
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      {children}
    </>
  )
}
