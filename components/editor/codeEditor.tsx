"use client"

import { useRef } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"

interface CodeEditorProps {
  // code: string
  // setCode: React.Dispatch<React.SetStateAction<string>>
  onRun : () => void
}

export const CodeEditor = ({ onRun }: CodeEditorProps) => {
  const { theme } = useTheme()
  const {code, setCode} = useAppStore()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }

  return (
    <div className="relative h-full w-full pt-2">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme={theme === "dark" ? "vs-dark" : "light"}
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
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-1 rounded-lg"
      >
        RUN
      </button>
    </div>
  )
}
