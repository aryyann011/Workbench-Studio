"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation" // <-- This reads the URL
import { getWorkspace, saveArchitecture } from "@/actions/workspace" // <-- Backend functions
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { useAppStore } from "@/lib/store"
import PromptBar from "@/components/editor/prompt-input"

export default function ResizableDemo() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string // Grabs the "new" or "abc-123" from the URL

  const { code, setCode, generateGraph } = useAppStore()
  const [prompt, setPrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (workspaceId === "new") {
      setCode(""); 
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
  }, [workspaceId, setCode, generateGraph]);

  const handleRun = () => {
    if (!code) return;
    generateGraph();
  };

  const handlePromptRun = async () => {
    if(!prompt) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      });

      const data = await response.json()
      if(data.code){
        setCode(data.code);
        setTimeout(() => generateGraph(), 0);
      }
    } catch (error) {
      console.error("Failed to call api", error);
    } finally{
      setPrompt("")
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
    <div className="flex flex-col w-full h-[calc(100vh-64px)]">
      {/* QUICK SAVE BAR AT THE TOP OF THE EDITOR */}
      {/* <div className="flex justify-end p-2 border-b bg-background">
        <button 
          onClick={handleSaveWorkspace}
          disabled={isSaving || !code}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Architecture"}
        </button>
      </div> */}

      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full h-full rounded-lg border-0"
      >
        <ResizablePanel defaultSize={50}>
          <div className="relative h-full p-4 pb-28">
            <div className="h-full">
              <CodeEditor onRun={handleRun}/>
            </div>
            <div className="w-full h-16 mt-2">
              <PromptBar prompt={prompt} setPrompt={setPrompt} onPromptRun={handlePromptRun} isloading={isLoading}/>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle/>

        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-6">
                <BaseEditor/>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}