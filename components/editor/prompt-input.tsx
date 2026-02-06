import { ArrowUp } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useState } from "react"

export default function PromptBar() {
  const [overlay, setOverlay] = useState(false)
  const MAX_HEIGHT = 180

  return (
    <div className="relative w-full p-4 border rounded-lg mt-4 thin-scrollbar">
      <div
        className={
          overlay
            ? "absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-20"
            : "relative w-full"
        }
      >
        <textarea
          rows={1}
          placeholder="Write to create..."
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = "auto"

            if (el.scrollHeight > MAX_HEIGHT) {
              setOverlay(true)
              el.style.height = MAX_HEIGHT + "px"
            } else {
              setOverlay(false)
              el.style.height = el.scrollHeight + "px"
            }
          }}
          className="
            w-full
            resize-none
            thin-scrollbar
            overflow-y-auto
            bg-gray-800
            max-h-[180px]
            rounded-xl
            px-4
            py-3
            outline-none
          "
        />

        <div className="absolute p-1 right-3 bottom-3 rounded-lg border cursor-pointer bg-blue-600">
          <ArrowUp />
        </div>
      </div>
    </div>
  )
}
