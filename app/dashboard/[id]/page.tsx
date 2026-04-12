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
import PromptBar, { ChatMessage } from "@/components/editor/prompt-input"


type ViewMode = "code" | "both" | "canvas";

export default function ResizableDemo() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string 

  const [isAIOpen, setIsAIOpen] = useState<boolean>(false) 
  const { code, setCode, generateGraph } = useAppStore()
  const [prompt, setPrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  const [viewMode, setViewMode] = useState<ViewMode>("both")

  useEffect(() => {
    if (workspaceId === "new") {
      if (!code) {
        setCode(""); 
      }
      return;
    }

    getWorkspace(workspaceId).then((data) => {
      if (data && data.code) {
        setCode(data.code);
        setTimeout(() => {
          generateGraph(); 
        }, 100);
      }
    });
    
    
  }, [workspaceId]);

  const handleRun = () => {
    if (!code) return;
    generateGraph();
  };

  const handlePromptRun = async () => {
    if(!prompt.trim()) return;
    
    const userText = prompt;
    setPrompt("");
    
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });

      const data = await response.json()
      if(data.code){
        setCode(data.code);
        setTimeout(() => generateGraph(), 0);
        
        setMessages(prev => [...prev, { role: "ai", content: "Architecture updated successfully." }]);
      }
    } catch (error) {
      console.error("Failed to call api", error);
      setMessages(prev => [...prev, { role: "ai", content: "Failed to generate architecture. Please try again." }]);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWorkspace = async () => {
    if (!code) return;
    setIsSaving(true);
    
    const result = await saveArchitecture(code, workspaceId);
    
    if (result.success && workspaceId === "new") {
      router.replace(`/dashboard/${result.id}`);
      alert("Successfully created and saved!");
    } else if (result.success) {
      alert("Successfully updated!");
    }
    
    setIsSaving(false);
  }
  
  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] relative bg-background overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center bg-background/80 backdrop-blur-md border border-border p-1 rounded-lg shadow-sm">
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

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={handleRun}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-border"
        >
          <Play className="w-4 h-4" />
          Run
        </button>

        <button
          onClick={handleSaveWorkspace}
          disabled={isSaving || !code}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setIsAIOpen(!isAIOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${isAIOpen ? 'bg-blue-600/10 text-blue-500 border-blue-500/50' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'}`}
        >
          <Sparkles className="w-4 h-4" />
          AI Chat
        </button>
      </div>

      <div 
        className={`absolute top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${isAIOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          className="absolute top-4 right-4 z-50 p-1 bg-muted hover:bg-muted-foreground/20 rounded-md text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <PromptBar 
          prompt={prompt} 
          setPrompt={setPrompt} 
          onPromptRun={handlePromptRun} 
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
              <div className="h-full w-full px-4 bg-zinc-950/50">
                <CodeEditor onRun={handleRun}/>
              </div>
            </ResizablePanel>
            
            {viewMode === "both" && <ResizableHandle withHandle />}
          </>
        )}

        {viewMode !== "code" && (
          <ResizablePanel defaultSize={viewMode === "canvas" ? 100 : 70}>
            <div className="h-full w-full bg-zinc-900/10">
              <BaseEditor/>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

    </div>
  )
}