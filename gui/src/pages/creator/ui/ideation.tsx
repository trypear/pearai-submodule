import { useCallback, useEffect, useRef } from "react"
import { RGBWrapper } from "../rgbBackground"
import { InputBox } from "../inputBox"
import { PearIcon } from "./pearIcon"
import { FileText, Pencil } from "lucide-react"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"

interface IdeationProps {
  initialMessage: string
  setInitialMessage: (message: string | ((prevText: string) => string)) => void
  handleRequest: () => void
  makeAPlan: boolean
  setMakeAPlan: (value: boolean) => void
}

export const Ideation: React.FC<IdeationProps> = ({
  initialMessage,
  setInitialMessage,
  handleRequest,
  makeAPlan,
  setMakeAPlan,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isCapturingRef = useRef(false)

  const forceFocus = useCallback(() => {
    if (!textareaRef.current) return

    try {
      textareaRef.current.focus()
      textareaRef.current.focus({ preventScroll: false })
      textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    } catch (e) {
      console.error("Focus attempt failed:", e)
    }
  }, [])

  useEffect(() => {
    forceFocus()

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture keystrokes if not focused on any textarea
      if (document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "INPUT") {
        return
      }

      // Handle single character keystrokes
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        e.stopPropagation()

        forceFocus()

        if (!isCapturingRef.current) {
          setInitialMessage((prevText) => prevText + e.key)
          isCapturingRef.current = true

          setTimeout(() => {
            isCapturingRef.current = false
          }, 100)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [forceFocus, setInitialMessage])

  return (
    <div className="flex gap-4 flex-col">
      <div className="flex justify-center align-middle text-[var(--focusBorder)] w-full gap-2 text-md animate transition-opacity">
        <PearIcon className="my-auto size-6" />
        <div className="my-auto">
          What would you like to make?
        </div>
      </div>
      <RGBWrapper className="px-4 my-auto w-full">
        <InputBox
          textareaRef={textareaRef}
          initialMessage={initialMessage}
          setInitialMessage={setInitialMessage}
          handleRequest={handleRequest}
          isDisabled={false}
          placeholder="Ask PearAI Creator to build anything"
          lockToWhite
          leftButtons={[
            {
              id: "make-plan",
              icon: <FileText />,
              label: "Make a plan",
              togglable: true,
              variant: "secondary",
              size: "sm",
              toggled: makeAPlan,
              onToggle: (t) => setMakeAPlan(t),
            },
            {
              id: "edit-path",
              icon: <Pencil className="size-4" />,
              label: "~/pearai/yeet",
              variant: "secondary",
              size: "sm",
              onClick: () => console.log("Edit path clicked"),
            },
          ]}
          submitButton={{
            id: "submit",
            label: "Start",
            icon: <ArrowTurnDownLeftIcon className="size-4" />,
            variant: "default" as const,
            size: "default" as const,
          }}
        />
      </RGBWrapper>
    </div>
  )
}