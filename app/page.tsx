"use client"

import { useEffect, useState } from "react"
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/diagramCanvas"
import { parseCode } from "@/lib/parser"
import { useAppStore } from "@/lib/store"

export default function ResizableDemo() {
  const [code, setCode] = useState<string>("")
  const setGraph = useAppStore((state) => state.setGraph)

  useEffect(() => {
    if(code){
      const result = parseCode(code)

      setGraph(result.nodes, result.edges)
    }
  }, [code, setGraph])
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[300px] w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          {/* <span className="font-semibold">One</span> */}
          <CodeEditor code={code} setCode={setCode}/>
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
