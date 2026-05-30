"use client"

import { useRef, useEffect, useState } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { Play } from "lucide-react"

interface CodeEditorProps {
  
  onRun : () => void
}

export const CodeEditor = ({ onRun }: CodeEditorProps) => {
  const { resolvedTheme } = useTheme()
  const {code, setCode} = useAppStore()
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (monacoRef.current && mounted) {
      monacoRef.current.editor.setTheme(
        resolvedTheme === 'dark' ? 'workbench-dark' : 'light'
      )
    }
  }, [resolvedTheme, mounted])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    
    monaco.editor.defineTheme('workbench-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#070709',
        'editor.lineHighlightBackground': '#141417',
        'editorGutter.background': '#070709',
      }
    })
    
    monaco.editor.setTheme(
      resolvedTheme === 'dark' ? 'workbench-dark' : 'light'
    )
    editor.focus()
  }

  const editorTheme = mounted
    ? (resolvedTheme === 'dark' ? 'workbench-dark' : 'light')
    : 'light' 

  return (
    <div className="relative h-full w-full pt-2">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme={editorTheme}
        value={code}
        onChange={(value) => setCode(value ?? "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "Geist Mono, monospace",
        }}
      />
      <button
        onClick={onRun}
        title="Run parser & layout (re-compile)"
        className="absolute bottom-5 right-5 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-500/30 hover:shadow-blue-600/20 hover:shadow-xl"
      >
        <Play className="w-4 h-4" />
        Run
      </button>
    </div>
  )
}
