"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAccessibleWorkspace, saveArchitecture } from "@/actions/workspace"
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { useAppStore } from "@/lib/store"
import { Code2, SquareSplitHorizontal, LayoutDashboard, Save, Sparkles, X } from "lucide-react"
import { WorkspaceShare } from "@/components/WorkspaceShare"
import PromptBar, { ChatMessage, ArchitectMode } from "@/components/editor/prompt-input"
import { toast } from "sonner"
import { Node, Edge } from "reactflow"
import { broadcastTimelineSync } from "@/hooks/useWorkspaceSocket"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ViewMode = "code" | "both" | "canvas";

export default function ResizableDemo() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string 

  const [isAIOpen, setIsAIOpen] = useState<boolean>(false) 
  const [workspaceName, setWorkspaceName] = useState<string>("Untitled")
  const { code, setCode, generateGraph, SetTheGraph, nodes, edges } = useAppStore()
  const [prompt, setPrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingText, setLoadingText] = useState<string>("Generating architecture...")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showNameDialog, setShowNameDialog] = useState<boolean>(false)
  const [saveName, setSaveName] = useState<string>("")
  
  const [viewMode, setViewMode] = useState<ViewMode>("both")
  const [canEdit, setCanEdit] = useState<boolean>(true)

  useEffect(() => {
    if (workspaceId === "new") {
      if (!code) {
        setCode(""); 
      }
      return;
    }

    getAccessibleWorkspace(workspaceId).then((data) => {
      if (data && data.success && data.workspace) {
        const ws = data.workspace;
        setCanEdit(data.canEdit || false);

        if (ws.code && ws.canvas_nodes && ws.canvas_edges) {
          setCode(ws.code);
          setWorkspaceName(ws.name || "Untitled");

          const parsedNodes = typeof ws.canvas_nodes === 'string' 
            ? JSON.parse(ws.canvas_nodes) 
            : ws.canvas_nodes;
            
          const parsedEdges = typeof ws.canvas_edges === 'string' 
            ? JSON.parse(ws.canvas_edges) 
            : ws.canvas_edges;

          setTimeout(() => {
            SetTheGraph(parsedNodes, parsedEdges); 
          }, 100);
        }
      }
    });
  }, [workspaceId]); 


  useEffect(() => {
    if (workspaceId === "new" || !code || nodes.length === 0) return;

    const saveTimer = setTimeout(() => {
      saveArchitecture(code, nodes, edges, workspaceId);
      console.log("[AUTO-SAVE] Canvas state permanently saved.");
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [nodes, edges, code, workspaceId]); 

  const handleRun = () => {
    if (!code) return;
    generateGraph();
  };

  const handlePromptRun = async () => {
    if(!prompt.trim()) return;
    
    const userText = prompt;
    setPrompt("");
    
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoadingText("Checking cached designs...");
    setIsLoading(true);

    try {
      const cacheRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, cacheCheckOnly: true }),
      });
      const cacheData = await cacheRes.json();

      setIsLoading(false);

      if (cacheData.cacheHit) {
        setMessages(prev => [...prev, {
          role: "cache-hit",
          content: "",
          cacheType: cacheData.cacheType,
          similarity: cacheData.similarity,
          cachedCode: cacheData.code,
          cachedPrompt: cacheData.cachedPrompt,
          pendingPrompt: userText,
        }]);
        return;
      }
    } catch (err) {
      console.warn("Cache check failed, proceeding to mode select:", err);
      setIsLoading(false);
    }

    setMessages(prev => [...prev, { role: "mode-select", content: "", pendingPrompt: userText }]);
  }

  const handleCacheDecision = async (decision: "use" | "new", promptText: string, cachedCode?: string) => {
    setMessages(prev => prev.map(msg =>
      msg.role === "cache-hit" && msg.pendingPrompt === promptText && !msg.cacheDecision
        ? { ...msg, cacheDecision: decision }
        : msg
    ));

    if (decision === "use" && cachedCode) {
      setCode(cachedCode);
      setTimeout(() => {
        generateGraph();
        setTimeout(() => broadcastTimelineSync(workspaceId), 100);
      }, 0);
      setMessages(prev => [...prev, { role: "ai", content: "Architecture loaded from cache." }]);
    } else {
      setMessages(prev => [...prev, { role: "mode-select", content: "", pendingPrompt: promptText }]);
    }
  }

  const handleModeSelected = async (mode: ArchitectMode, promptText: string) => {
    setMessages(prev => prev.map(msg => 
      msg.role === "mode-select" && msg.pendingPrompt === promptText && !msg.selectedMode
        ? { ...msg, selectedMode: mode }
        : msg
    ));
    setLoadingText("Generating architecture...");
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText, skipCache: true, mode }),
      });

      const data = await response.json()
      if(data.code){
        setCode(data.code);
        setTimeout(() => {
          generateGraph();
          setTimeout(() => broadcastTimelineSync(workspaceId), 100);
        }, 0);
        setMessages(prev => [...prev, { role: "ai", content: "Architecture generated successfully." }]);
      }
    } catch (error) {
      console.error("Failed to call api", error);
      setMessages(prev => [...prev, { role: "ai", content: "Failed to generate architecture. Please try again." }]);
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateNew = async (promptText: string) => {
    setMessages(prev => [
      ...prev,
      { role: "user", content: `🔄 Regenerating: ${promptText}` },
      { role: "mode-select", content: "", pendingPrompt: promptText }
    ]);
  }

  const handleSaveClick = () => {
    if (!code) return;
    setSaveName(workspaceName === "Untitled" || workspaceName === "Untitled Architecture" ? "" : workspaceName);
    setShowNameDialog(true);
  }

  const handleSaveWorkspace = async () => {
    if (!code) return;
    const finalName = saveName.trim() || "Untitled Architecture";
    setShowNameDialog(false);
    
    if (workspaceId === "new") {
      setIsSaving(true);
      const promise = saveArchitecture(code, nodes, edges, workspaceId, undefined, finalName);
      
      toast.promise(promise, {
        loading: 'Creating workspace...',
        success: (result) => {
          setIsSaving(false);
          if (result.success) {
            setWorkspaceName(finalName);
            router.replace(`/dashboard/${result.id}`);
            return "Successfully created and saved!";
          } else {
            throw new Error(result.error || "Failed to save workspace");
          }
        },
        error: (err) => {
          setIsSaving(false);
          return err.message;
        }
      });
      return;
    }

    // For existing workspace: fire and forget background save
    setWorkspaceName(finalName);
    setIsSaving(true); // briefly show saving state
    
    // Start background save without blocking
    saveArchitecture(code, nodes, edges, workspaceId, undefined, finalName)
      .then((result) => {
        setIsSaving(false);
        if (result.success) {
          toast.success("Successfully updated!");
        } else {
          toast.error(result.error || "Failed to save workspace");
        }
      })
      .catch((err) => {
        setIsSaving(false);
        toast.error("An unexpected error occurred while saving");
      });
  }
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "both") {
        setViewMode("canvas")
      }
    }
    window.addEventListener("resize", handleResize)
    handleResize() 
    return () => window.removeEventListener("resize", handleResize)
  }, [viewMode])

  return (
    <div className="flex flex-col w-full h-full relative bg-background overflow-hidden">
      
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 border-b border-border bg-[#07070a] h-12 shrink-0 z-40 select-none">
        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/5">
          <button 
            onClick={() => setViewMode("code")} 
            className={`px-3 py-1 rounded text-xs transition-colors font-medium ${viewMode === 'code' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Code
          </button>
          <button 
            onClick={() => setViewMode("canvas")} 
            className={`px-3 py-1 rounded text-xs transition-colors font-medium ${viewMode === 'canvas' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Canvas
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <WorkspaceShare 
            workspaceId={workspaceId === "new" ? "" : workspaceId}
            workspaceName={workspaceName}
            iconOnly={true}
          />

          <button
            onClick={handleSaveClick}
            disabled={isSaving || !code || !canEdit}
            title={canEdit ? "Save architecture" : "You do not have permission to save"}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center size-8 shrink-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4"/>
          </button>
          <button
            onClick={() => setIsAIOpen(!isAIOpen)}
            title="AI Chat"
            className={`p-1.5 rounded-md border transition-colors flex items-center justify-center size-8 shrink-0 ${isAIOpen ? 'bg-blue-600/10 text-blue-500 border-blue-500/50' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 items-center bg-background/80 backdrop-blur-md border border-border p-1 rounded-lg shadow-sm">
        <button 
          onClick={() => setViewMode("code")} 
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${viewMode === 'code' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Code2 className="w-4 h-4" /> Code
        </button>
        <button 
          onClick={() => setViewMode("both")} 
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${viewMode === 'both' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <SquareSplitHorizontal className="w-4 h-4" /> Both
        </button>
        <button 
          onClick={() => setViewMode("canvas")} 
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${viewMode === 'canvas' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Canvas
        </button>
      </div>

      <div className="hidden md:flex absolute top-3 right-4 z-50 items-center gap-2">
        <WorkspaceShare 
          workspaceId={workspaceId === "new" ? "" : workspaceId}
          workspaceName={workspaceName}
        />



        <button
          onClick={handleSaveClick}
          disabled={isSaving || !code || !canEdit}
          title={canEdit ? "Save architecture" : "You do not have permission to save"}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 h-9 rounded-md text-sm font-semibold transition-colors shadow-md disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4"/>
          <span className="hidden lg:inline">{isSaving ? "Saving..." : "Save"}</span>
        </button>
        <button
          onClick={() => setIsAIOpen(!isAIOpen)}
          title="AI Chat"
          className={`flex items-center justify-center gap-2 px-3 lg:px-4 h-9 rounded-md text-sm font-semibold transition-colors border shrink-0 ${isAIOpen ? 'bg-blue-600/10 text-blue-500 border-blue-500/50' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden lg:inline">AI Chat</span>
        </button>
      </div>

      <div 
        className={`absolute top-0 right-0 h-full w-[85vw] max-w-sm md:w-80 z-50 transform transition-transform duration-300 ease-in-out ${isAIOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          className="absolute top-4 right-4 z-50 p-1 bg-muted hover:bg-muted-foreground/20 rounded-md text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4 cursor-pointer" onClick={() => setIsAIOpen(!isAIOpen)}/>
        </button>
        
        <PromptBar 
          prompt={prompt} 
          setPrompt={setPrompt} 
          onPromptRun={handlePromptRun} 
          onRegenerateNew={handleRegenerateNew}
          onModeSelected={(mode, pendingPrompt) => handleModeSelected(mode, pendingPrompt)}
          onCacheDecision={(decision, promptText, cachedCode) => handleCacheDecision(decision, promptText, cachedCode)}
          isloading={isLoading}
          loadingText={loadingText}
          messages={messages} 
        />
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full h-full rounded-none border-0"
      >
        {viewMode !== "canvas" && (
          <>
            <ResizablePanel defaultSize={viewMode === "code" ? 100 : 30} minSize={20}>
              <div className="h-full w-full px-4 bg-background">
                <CodeEditor onRun={handleRun}/>
              </div>
            </ResizablePanel>
            
            {viewMode === "both" && <ResizableHandle withHandle />}
          </>
        )}

        {viewMode !== "code" && (
          <ResizablePanel defaultSize={viewMode === "canvas" ? 100 : 70}>
            <div className="h-full w-full bg-background/50 dark:bg-zinc-900/10">
              <BaseEditor readOnly={!canEdit}/>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Save Architecture</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. My Awesome Backend"
              className="bg-background text-foreground border-border focus-visible:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveWorkspace();
                }
              }}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowNameDialog(false)}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted text-muted-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkspace}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
