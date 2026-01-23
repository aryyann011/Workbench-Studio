"use client"

import { useRef } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
}

export const CodeEditor = ({ code, setCode }: CodeEditorProps) => {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }

  return (
    <div className="h-full w-full pt-2">
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
    </div>
  )
}
