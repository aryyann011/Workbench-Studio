"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
// These are the exact exports from the file you provided
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel(
  props: React.ComponentProps<typeof Panel>
) {
  return (
    <Panel
      data-slot="resizable-panel"
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      {...props}
      className={cn(
        // base divider
        "relative flex w-2 items-center justify-center bg-border",
        // hover + active feedback
        "hover:bg-muted transition-colors",
        // cursor
        "cursor-col-resize",
        // vertical mode support
        "data-[panel-group-direction=vertical]:h-2",
        "data-[panel-group-direction=vertical]:w-full",
        className
      )}
    >
      {withHandle && (
        <div className="absolute z-10 flex h-7 w-5 items-center justify-center rounded-md border bg-background shadow-sm">
          <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </Separator>
  )
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
}