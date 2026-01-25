"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/editor/codeEditor"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { BaseEditor } from "@/components/reactFlow/base"

export default function ResizableDemo() {
  const [code, setCode] = useState("")
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
