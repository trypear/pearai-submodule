import { useCallback, useEffect, useRef, useState, useContext } from "react"
import { RGBWrapper } from "../rgbBackground"
import { InputBox } from "../inputBox"
import { PearIcon } from "./pearIcon"
import { FileText, Pencil } from "lucide-react"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { IdeMessengerContext } from "../../../context/IdeMessenger"

interface IdeationProps {
  initialMessage: string
  setInitialMessage: (message: string | ((prevText: string) => string)) => void
  handleRequest: () => void
  makeAPlan: boolean
  setMakeAPlan: (value: boolean) => void
  className?: string;
}

export const Ideation: React.FC<IdeationProps> = ({
  initialMessage,
  setInitialMessage,
  handleRequest,
  makeAPlan,
  setMakeAPlan,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isCapturingRef = useRef(false)
  const [projectPath, setProjectPath] = useState("~/pearai-projects/")
  const ideMessenger = useContext(IdeMessengerContext)

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

  const handleDirectorySelect = useCallback(async () => {
    try {
      const response = await ideMessenger.request("pearSelectFolder", { openLabel: "Select" });
      if (response) {
        const dirName = response;
        if (dirName) {
          setProjectPath(`${dirName}`);
        }
      }
    } catch (err) {
      console.error('Failed to select directory:', err);
    }
  }, [ideMessenger]);

  // Display just the main folder name, as the path is usually extremely long
  const displayPath = projectPath.includes('~') ? projectPath : projectPath.split(/[/\\]/).pop() + "/";
  return (
    <div className={cn("flex gap-4 flex-col", className)}>
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
          maxHeight="30vh"
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
              id: "path-select",
              icon: <Pencil className="size-4" />,
              label: displayPath,
              variant: "secondary",
              size: "sm",
              onClick: handleDirectorySelect,
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