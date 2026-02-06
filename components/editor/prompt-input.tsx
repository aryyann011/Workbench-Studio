import { ArrowUp } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"

export default function PromptBar(){
    return(
        <div className="w-full relative m-4 bg-transparent rounded-xl">
            <TextareaAutosize
            minRows={1}
            maxRows={6}
            placeholder="Write to create..."
            className="
                w-full
                resize-none
                bg-neutral-900
                text-white
                rounded-xl
                p-6
                outline-none
            "
            />
            <div className="absolute p-1 right-3 bottom-4 rounded-lg border cursor-pointer bg-blue-600">
                <ArrowUp className="rounded-lg"/>
            </div>
        </div>
    )
}