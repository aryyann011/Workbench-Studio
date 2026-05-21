"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { CodeEditor } from "@/components/editor/codeEditor"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { useAppStore } from "@/lib/store"
import { Code2, Loader2, AlertCircle, Eye, Users } from "lucide-react"
import { Node, Edge } from "reactflow"

type ViewMode = "code" | "both" | "canvas"

export default function SharedWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const shareToken = params.token as string

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { code, setCode, generateGraph, SetTheGraph, nodes, edges } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>("both")
  const [canEdit, setCanEdit] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string>("Shared Workspace")
  const [role, setRole] = useState<string>("READER")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [workspaceId, setWorkspaceId] = useState<string>("")

  useEffect(() => {
    async function loadSharedWorkspace() {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/share/validate?token=${shareToken}`
        )

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Unable to access shared workspace")
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (data.success) {
          setCode(data.workspace.code || "")
          setCanEdit(data.canEdit)
          setWorkspaceName(data.workspace.name || "Shared Workspace")
          setRole(data.role)
          setWorkspaceId(data.workspace.id)

          const parsedNodes = typeof data.workspace.canvas_nodes === "string"
            ? JSON.parse(data.workspace.canvas_nodes)
            : data.workspace.canvas_nodes || []

          const parsedEdges = typeof data.workspace.canvas_edges === "string"
            ? JSON.parse(data.workspace.canvas_edges)
            : data.workspace.canvas_edges || []

          setTimeout(() => {
            SetTheGraph(parsedNodes, parsedEdges)
          }, 100)
        }
      } catch (err) {
        setError("Failed to load shared workspace")
        console.error("Error loading workspace:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (shareToken) {
      loadSharedWorkspace()
    }
  }, [shareToken])

  // Auto-save for collaborators
  useEffect(() => {
    if (!canEdit || !code || nodes.length === 0 || !workspaceId) return

    const saveTimer = setTimeout(async () => {
      try {
        setIsSaving(true)
        await fetch("/api/share/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            shareToken,
            code,
            nodes,
            edges
          })
        })
      } catch (err) {
        console.error("Error saving shared workspace:", err)
      } finally {
        setIsSaving(false)
      }
    }, 3000)

    return () => clearTimeout(saveTimer)
  }, [nodes, edges, code, canEdit, shareToken, workspaceId])

  const handleRun = () => {
    if (!code) return
    generateGraph()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading shared workspace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold truncate">{workspaceName}</h1>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
              canEdit
                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
            }`}
          >
            {canEdit ? (
              <><Users className="w-3 h-3" /> Collaborator</>
            ) : (
              <><Eye className="w-3 h-3" /> Viewer</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {canEdit && (
            <button
              onClick={() => setViewMode(viewMode === "code" ? "both" : "code")}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Toggle code editor"
            >
              <Code2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "both" && canEdit ? (
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <CodeEditor onRun={handleRun} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <BaseEditor />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === "code" && canEdit ? (
          <CodeEditor onRun={handleRun} />
        ) : (
          <BaseEditor />
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
        {canEdit && (
          <button
            onClick={handleRun}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm"
          >
            ▶ Generate
          </button>
        )}
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground">
          Shared workspace • {role.toLowerCase()} access
        </p>
      </div>
    </div>
  )
}
