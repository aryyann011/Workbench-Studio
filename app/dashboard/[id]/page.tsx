"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getWorkspace, saveArchitecture } from "@/actions/workspace"
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { useAppStore } from "@/lib/store"
import { Code2, SquareSplitHorizontal, LayoutDashboard, Save, Play, Sparkles, X } from "lucide-react"
import { WorkspaceShare } from "@/components/WorkspaceShare"
import PromptBar, { ChatMessage, ArchitectMode } from "@/components/editor/prompt-input"
import { toast } from "sonner"
import { Node, Edge } from "reactflow"
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket"

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
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  const [viewMode, setViewMode] = useState<ViewMode>("both")

  const { broadcastSync } = useWorkspaceSocket(workspaceId)

  useEffect(() => {
    if (workspaceId === "new") {
      if (!code) {
        setCode(""); 
      }
      return;
    }

    getWorkspace(workspaceId).then((data) => {
      if (data && data.code && data.canvas_nodes && data.canvas_edges) {
        setCode(data.code);
        setWorkspaceName(data.name || "Untitled");

        const parsedNodes = typeof data.canvas_nodes === 'string' 
          ? JSON.parse(data.canvas_nodes) 
          : data.canvas_nodes;
          
        const parsedEdges = typeof data.canvas_edges === 'string' 
          ? JSON.parse(data.canvas_edges) 
          : data.canvas_edges;

        setTimeout(() => {
          SetTheGraph(parsedNodes, parsedEdges); 
        }, 100);
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

    try {
      const cacheRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, cacheCheckOnly: true }),
      });
      const cacheData = await cacheRes.json();

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
        setTimeout(() => broadcastSync(), 100);
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
          setTimeout(() => broadcastSync(), 100);
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

  const handleSaveWorkspace = async () => {
    if (!code) return;
    setIsSaving(true);
    
    const result = await saveArchitecture(code, nodes, edges, workspaceId);
    
    if (result.success) {
      if (workspaceId === "new") {
        router.replace(`/dashboard/${result.id}`);
        toast.success("Successfully created and saved!");
      } else {
        toast.success("Successfully updated!");
      }
    } else {
      toast.error(result.error || "Failed to save workspace");
    }
    
    setIsSaving(false);
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
            onClick={handleRun}
            title="Run compiler"
            className="p-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md border border-border transition-colors flex items-center justify-center size-8 shrink-0"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveWorkspace}
            disabled={isSaving || !code}
            title="Save architecture"
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
          onClick={handleRun}
          title="Run compiler"
          className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 lg:px-4 h-9 rounded-md text-sm font-semibold transition-colors border border-border shrink-0"
        >
          <Play className="w-4 h-4" />
          <span className="hidden lg:inline">Run</span>
        </button>

        <button
          onClick={handleSaveWorkspace}
          disabled={isSaving || !code}
          title="Save architecture"
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
              <BaseEditor/>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

    </div>
  )
}
