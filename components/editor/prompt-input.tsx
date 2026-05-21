"use client"

import { ArrowUp, Loader2, Bot, User, RefreshCw, Database } from "lucide-react"
import { useEffect, useRef } from "react"

export type ChatMessage = {
  role: "user" | "ai";
  content: string;
  fromCache?: boolean;
  cacheType?: string;
  similarity?: number;
  originalPrompt?: string;
}

interface CodeEditorProps {
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  onPromptRun: () => void
  onRegenerateNew?: (promptText: string) => void
  isloading: boolean
  messages: ChatMessage[] 
}

export default function PromptBar({ prompt, setPrompt, onPromptRun, onRegenerateNew, isloading, messages }: CodeEditorProps) {
  const MAX_HEIGHT = 150
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isloading])

  // Find the user message right before a cached AI message
  const findUserPromptBefore = (aiIndex: number): string => {
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return "";
  }

  return (
    <div className="flex flex-col h-full w-full bg-card shadow-2xl border-l border-border">
      
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30 shrink-0">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-sm">AI Architect</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 thin-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <Bot className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-xs">Describe your architecture.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-muted border border-border"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-1.5 max-w-[85%]">
                  <div className={`px-3 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-muted border border-border rounded-tl-none"}`}>
                    {msg.content}
                  </div>

                  {/* Cache indicator badge + Create New button */}
                  {msg.role === "ai" && msg.fromCache && (
                    <div className="flex items-center gap-2 ml-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Database className="w-3 h-3" />
                        {msg.cacheType === 'EXACT' ? 'Cached' : `${msg.similarity}% match`}
                      </span>
                      <button
                        onClick={() => {
                          const userPrompt = msg.originalPrompt || findUserPromptBefore(index);
                          if (userPrompt && onRegenerateNew) {
                            onRegenerateNew(userPrompt);
                          }
                        }}
                        disabled={isloading}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold
                          bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 
                          border border-blue-500/30 hover:border-blue-400/60 
                          hover:from-blue-600/30 hover:to-purple-600/30 hover:text-blue-300
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-200 cursor-pointer group"
                      >
                        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                        Create New
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isloading && (
          <div className="flex gap-3 flex-row">
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-3 py-2 rounded-lg bg-muted border border-border rounded-tl-none flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating architecture...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-border shrink-0">
        <div className="relative flex items-end gap-2 bg-muted/50 focus-within:bg-muted border border-transparent focus-within:border-border rounded-xl p-2 transition-colors">
          <textarea
            rows={1}
            placeholder="E.g., Add a Redis cache..."
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px"
            }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
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
      </div>
      
    </div>
  )
}