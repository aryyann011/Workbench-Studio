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
  const [code, setCode] = useState<string>("")
  const setGraph = useAppStore((state) => state.setGraph)

  // useAutoEnrichment(); 

  const handleRun = () => {
    if (!code) return;
    const result = parseCode(code);
    setGraph(result.nodes, result.edges);
  };
  
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[300px] w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="relative h-full p-4 pb-28">
          {/* <span className="font-semibold">One</span> */}
          <div className="h-full">
            <CodeEditor code={code} setCode={setCode} onRun={handleRun}/>
          </div>
          {/* <div className="relative"> */}
          <div className="w-full h-[64px]">
            <PromptBar />
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
