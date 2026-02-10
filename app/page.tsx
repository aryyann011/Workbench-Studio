"use client"

import { useEffect, useState } from "react"
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { useAutoEnrichment } from "@/hooks/auto-enrichment"
import { parseCode } from "@/lib/parser"
import { useAppStore } from "@/lib/store"
import PromptBar from "@/components/editor/prompt-input"

export default function ResizableDemo() {
  const {code, setCode, generateGraph} = useAppStore()
  const [prompt, setPrompt] = useState<string>("")
  const [isloading, SetIsloading] = useState<boolean>(false)

  // useAutoEnrichment(); 

  const handleRun = () => {
    if (!code) return;
    generateGraph();
  };

  const handlePromptRun = async () => {
    if(!prompt) return;
    SetIsloading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      });

      const data = await response.json()

      if(data.code){
        setCode(data.code);
        setTimeout(() => {
            generateGraph(); 
        }, 0);
      }


    } catch (error) {
      console.error("Failed to call api", error);
    } finally{
      setPrompt("")
      SetIsloading(false)
    }

  }
  
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[300px] w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="relative h-full p-4 pb-28">
          {/* <span className="font-semibold">One</span> */}
          <div className="h-full">
            <CodeEditor onRun={handleRun}/>
          </div>
          {/* <div className="relative"> */}
          <div className="w-full h-[64px]">
            <PromptBar prompt={prompt} setPrompt={setPrompt} onPromptRun={handlePromptRun} isloading={isloading}/>
          </div>

          {/* </div> */}
        </div>
      </ResizablePanel>

      <ResizableHandle/>

      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              {/* <span className="font-semibold">Two</span> */}
              <BaseEditor/>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
