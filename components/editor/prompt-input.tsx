"use client"

import { ArrowUp, Loader2, Bot } from "lucide-react"
import { useState } from "react"

interface CodeEditorProps {
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  onPromptRun: () => void
  isloading: boolean
}

export default function PromptBar({ prompt, setPrompt, onPromptRun, isloading }: CodeEditorProps) {
  const MAX_HEIGHT = 150

  return (
    <div className="flex flex-col h-full w-full bg-card shadow-2xl border-l border-border">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-sm">AI Architect</h3>
      </div>

      {/* CHAT HISTORY AREA (Empty for now, ready for future updates) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center text-muted-foreground/50">
        <Bot className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-xs">Describe your architecture.</p>
        <p className="text-xs">I will generate the layout.</p>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-background border-t border-border">
        <div className="relative flex items-end gap-2 bg-muted/50 focus-within:bg-muted border border-transparent focus-within:border-border rounded-xl p-2 transition-colors">
          <textarea
            rows={1}
            placeholder="E.g., A Next.js app with a Redis cache..."
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px"
            }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              // Submit on Enter (but allow Shift+Enter for new lines)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onPromptRun();
              }
            }}
            className="w-full resize-none bg-transparent text-sm px-2 py-1 outline-none thin-scrollbar"
          />
          
          <button 
            onClick={onPromptRun}
            disabled={isloading || !prompt.trim()}
            className="p-2 mb-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
          >
            {isloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Press Enter to generate, Shift + Enter for new line.
        </p>
      </div>
      
    </div>
  )
}