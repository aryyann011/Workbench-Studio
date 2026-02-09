import { ArrowUp } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useState } from "react"

interface CodeEditorProps {
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  onPromptRun : () => void
}

export default function PromptBar({ prompt, setPrompt, onPromptRun } : CodeEditorProps) {
  const MAX_HEIGHT = 180

  return (
    <div className="absolute bottom-0 inset-x-0 z-20 w-full">
      <div className="mx-auto w-[100%] p-8">
        <textarea
          rows={1}
          placeholder="Write to create..."
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = "auto"
            el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px"
          }}
          value={prompt}
          onChange={(e)=> setPrompt(e.target.value)}
          className="
            w-full
            resize-none
            thin-scrollbar
            overflow-y-auto
            bg-gray-800
            rounded-xl
            px-8
            py-5
            outline-none
          "
        />
      </div>
      <div onClick={onPromptRun} className="absolute p-1 right-10 bottom-13 rounded-lg border cursor-pointer bg-blue-600">
        <ArrowUp />
      </div>
    </div>
  )
}
