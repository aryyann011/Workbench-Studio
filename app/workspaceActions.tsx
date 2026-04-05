"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Trash, ExternalLink, Loader2 } from "lucide-react"
import { deleteArchitecture } from "@/actions/workspace"
import { useRouter } from "next/navigation"

export function WorkspaceActions({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // UI Logic: Close menu if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    
    // ==========================================
    // YOUR LOGIC HERE: 
    // Use the Next.js router to navigate to `/dashboard/${workspaceId}`
    // ==========================================
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)

    const ans = window.confirm("Are you sure you want to delete this?")
    if(!ans) return;
    // 2. If they say yes, set isDeleting to true
    // 3. Await the deleteArchitecture Server Action
    // 4. Set isDeleting back to false
    // ==========================================
  }

  return (
    <div ref={menuRef} className="absolute top-4 right-4 z-20">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-1.5 bg-background/50 backdrop-blur-sm border border-border hover:bg-muted text-muted-foreground rounded-md transition-colors shadow-sm"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-lg overflow-hidden py-1">
          <button
            onClick={handleOpen}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}