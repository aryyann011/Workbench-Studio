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

export default function ResizableDemo() {
  const [code, setCode] = useState<string>("")
  const setGraph = useAppStore((state) => state.setGraph)

  useAutoEnrichment(); 

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
        <div className="relative flex flex-col h-full items-center justify-center p-6">
          {/* <span className="font-semibold">One</span> */}
          <CodeEditor code={code} setCode={setCode}/>
          {/* <div className="relative"> */}
            <button onClick={handleRun} className="absolute cursor-pointer bg-blue-600 border rounded-lg p-1 pl-4 pr-4 right-12 bottom-10">RUN</button>
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
