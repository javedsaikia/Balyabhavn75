'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="bg-black text-white font-sans min-h-screen">
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-red-500/15 via-orange-500/10 to-transparent blur-2xl"></div>
                <div className="relative w-16 h-16 ring-1 ring-white/10 flex bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                  <AlertTriangle className="w-8 h-8 text-red-300" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong!</h1>
              <p className="text-white/70">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <Link 
                href="/" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-white/60 hover:text-white/80">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300 overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}