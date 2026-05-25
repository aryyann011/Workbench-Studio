"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacyLandingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      <div className="text-sm font-medium animate-pulse">Redirecting to Workbench Studio...</div>
    </div>
  )
}
