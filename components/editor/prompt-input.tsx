"use client"

import { ArrowUp, Loader2, Bot, User, RefreshCw, Database, Zap, Scale, Microscope, CheckCircle2, Sparkles } from "lucide-react"
import { useEffect, useRef } from "react"

export type ArchitectMode = "minimal" | "balanced" | "detailed";

export type ChatMessage = {
  role: "user" | "ai" | "mode-select" | "cache-hit";
  content: string;
  fromCache?: boolean;
  cacheType?: string;
  similarity?: number;
  originalPrompt?: string;
  pendingPrompt?: string;
  selectedMode?: ArchitectMode;
  // cache-hit specific
  cachedCode?: string;
  cachedPrompt?: string;
  cacheDecision?: "use" | "new";
}

interface CodeEditorProps {
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  onPromptRun: () => void
  onRegenerateNew?: (promptText: string) => void
  onModeSelected?: (mode: ArchitectMode, promptText: string) => void
  onCacheDecision?: (decision: "use" | "new", promptText: string, cachedCode?: string) => void
  isloading: boolean
  loadingText?: string
  messages: ChatMessage[] 
}

const MODE_CONFIG: Record<ArchitectMode, { icon: React.ReactNode; label: string; desc: string; color: string; bg: string; border: string }> = {
  minimal: {
    icon: <Zap className="w-3.5 h-3.5" />,
    label: "Minimal",
    desc: "4-6 nodes · Executive overview",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  balanced: {
    icon: <Scale className="w-3.5 h-3.5" />,
    label: "Balanced",
    desc: "8-11 nodes · Clean architecture",
    color: "text-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  detailed: {
    icon: <Microscope className="w-3.5 h-3.5" />,
    label: "Detailed",
    desc: "10-14 nodes · Deep infrastructure",
    color: "text-purple-400",
    bg: "bg-purple-500/10 hover:bg-purple-500/20",
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
};

export default function PromptBar({ prompt, setPrompt, onPromptRun, onRegenerateNew, onModeSelected, onCacheDecision, isloading, loadingText, messages }: CodeEditorProps) {
  const MAX_HEIGHT = 150
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isloading])

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
          messages.map((msg, index) => {

            // ── Cache hit decision card ──
            if (msg.role === "cache-hit") {
              return (
                <div key={index} className="flex gap-3 flex-row">
                  <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[85%]">
                    <div className="px-3 py-2 rounded-lg text-sm bg-muted border border-border rounded-tl-none">
                      <span className="text-muted-foreground">Found a </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Database className="w-2.5 h-2.5" />
                        {msg.cacheType === 'EXACT' ? 'exact' : `${msg.similarity}%`} match
                      </span>
                      {msg.cachedPrompt && (
                        <span className="text-muted-foreground text-xs block mt-1 italic opacity-70">
                          from: &quot;{msg.cachedPrompt.length > 50 ? msg.cachedPrompt.slice(0, 50) + '...' : msg.cachedPrompt}&quot;
                        </span>
                      )}
                    </div>
                    {msg.cacheDecision ? (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border opacity-70 ${
                        msg.cacheDecision === 'use' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {msg.cacheDecision === 'use' ? (
                          <><CheckCircle2 className="w-3 h-3" /> Using cached result</>
                        ) : (
                          <><Sparkles className="w-3 h-3" /> Generating fresh</>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          disabled={isloading}
                          onClick={() => onCacheDecision?.("use", msg.pendingPrompt || "", msg.cachedCode)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer
                            bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 hover:border-amber-500/40 text-amber-400
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Use Cached
                        </button>
                        <button
                          disabled={isloading}
                          onClick={() => onCacheDecision?.("new", msg.pendingPrompt || "")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer
                            bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40 text-blue-400
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate New
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // ── Mode selection card ──
            if (msg.role === "mode-select") {
              return (
                <div key={index} className="flex gap-3 flex-row">
                  <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[85%]">
                    <div className="px-3 py-2 rounded-lg text-sm bg-muted border border-border rounded-tl-none text-muted-foreground">
                      Choose detail level:
                    </div>
                    {msg.selectedMode ? (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${MODE_CONFIG[msg.selectedMode].bg} ${MODE_CONFIG[msg.selectedMode].border} ${MODE_CONFIG[msg.selectedMode].color} opacity-70`}>
                        {MODE_CONFIG[msg.selectedMode].icon}
                        {MODE_CONFIG[msg.selectedMode].label} selected
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {(["minimal", "balanced", "detailed"] as ArchitectMode[]).map((mode) => {
                          const cfg = MODE_CONFIG[mode];
                          return (
                            <button
                              key={mode}
                              disabled={isloading}
                              onClick={() => {
                                if (onModeSelected && msg.pendingPrompt) {
                                  onModeSelected(mode, msg.pendingPrompt);
                                }
                              }}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${cfg.bg} ${cfg.border} group`}
                            >
                              <span className={`${cfg.color} transition-transform group-hover:scale-110`}>
                                {cfg.icon}
                              </span>
                              <div className="flex flex-col">
                                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                                <span className="text-[10px] text-muted-foreground">{cfg.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // ── Regular user/AI messages ──
            return (
              <div key={index} className="flex flex-col gap-1.5">
                <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-muted border border-border"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    <div className={`px-3 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-muted border border-border rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isloading && (
          <div className="flex gap-3 flex-row">
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-3 py-2 rounded-lg bg-muted border border-border rounded-tl-none flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> {loadingText || "Generating architecture..."}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-border shrink-0">
        <div className="relative flex items-end gap-2 bg-muted/50 focus-within:bg-muted border border-transparent focus-within:border-border rounded-xl p-2 transition-colors">
          <textarea
            rows={1}
            placeholder="E.g., Design backend of youtube"
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