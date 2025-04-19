import { useCallback, useEffect, useRef, useState, useContext } from "react"
import { RGBWrapper } from "../rgbBackground"
import { InputBox } from "../inputBox"
import { PearIcon } from "./pearIcon"
import { FileText, FolderPlus, Pencil } from "lucide-react"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { IdeMessengerContext } from "../../../context/IdeMessenger"

interface ProjectConfig {
  path: string;
  name: string;
}

interface IdeationProps {
  initialMessage: string
  setInitialMessage: (message: string | ((prevText: string) => string)) => void
  handleRequest: () => void
  makeAPlan: boolean
  setMakeAPlan: (value: boolean) => void
  className?: string;
  projectConfig: ProjectConfig;
  setProjectConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>;
}

export const Ideation: React.FC<IdeationProps> = ({
  initialMessage,
  setInitialMessage,
  handleRequest,
  makeAPlan,
  setMakeAPlan,
  className,
  projectConfig,
  setProjectConfig
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const projectNameRef = useRef<HTMLInputElement | null>(null)
  const isCapturingRef = useRef(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [hasWorkspaceFolders, setHasWorkspaceFolders] = useState(true)
  const ideMessenger = useContext(IdeMessengerContext)

  useEffect(() => {
    const checkWorkspaceFolders = async () => {
      try {
        let folders = await ideMessenger.request("getWorkspaceDirs", undefined)
        // TESTING TO EMULATE NO WORKSPACE FOLDERS, DO NOT USE IN PRODUCTION
        // folders = []
        console.dir("WORKSPACE FOLDERS:")
        console.dir(folders)
        setHasWorkspaceFolders(Array.isArray(folders) && folders.length > 0)
        if (!folders || folders.length === 0) {
          setIsPopoverOpen(true)
        }
      } catch (err) {
        console.error('Failed to check workspace folders:', err)
        setHasWorkspaceFolders(false)
        setIsPopoverOpen(true)
      }
    }
    checkWorkspaceFolders()
  }, [ideMessenger])

  // Set default project path when isPopoverOpen changes
  useEffect(() => {
    if (isPopoverOpen || !hasWorkspaceFolders) {
      setProjectConfig(prev => ({ ...prev, path: "~/pearai-projects/" }));
    } else {
      setProjectConfig({ path: "", name: "" });
    }
  }, [isPopoverOpen, hasWorkspaceFolders, setProjectConfig]);

  // Focus project name input when popover opens
  useEffect(() => {
    if (isPopoverOpen && projectNameRef.current) {
      projectNameRef.current.focus();
    }
  }, [isPopoverOpen]);

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
    console.log("handleDirectorySelect called with projectName:", projectConfig.name);
    try {
      const response = await ideMessenger.request("pearSelectFolder", { openLabel: "Select" });

      if (response && typeof response === 'string') {
        const dirName = response;
          // Use default if name is empty or just whitespace
          console.dir("DIR IN HANDLE DIRECTORY SELECT:")
          console.dir(dirName)
          console.dir(projectConfig.name)
          const projectName = projectConfig.name.trim() || "default";
          setProjectConfig({ name: projectName, path: dirName });
      }
    } catch (err) {
      console.error('Failed to select directory:', err);
    }
  }, [ideMessenger, projectConfig.name, setProjectConfig]);

  // Display just the main folder name, as the path is usually extremely long
  const displayPath = projectConfig.path.includes('~') ? projectConfig.path : projectConfig.path.split(/[/\\]/).pop() + "/";

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  return (
    <div className={cn("flex gap-4 flex-col", className)}>
      <div className="flex justify-center align-middle text-[var(--focusBorder)] w-full gap-2 text-md animate transition-opacity">
        <PearIcon className="my-auto size-6" />
        <div className="my-auto">
          {isPopoverOpen ? "What would you like to make?" : "What would you like to do?"}
        </div>
      </div>
      <RGBWrapper className="px-4 my-auto w-full">
        <InputBox
          textareaRef={textareaRef}
          initialMessage={initialMessage}
          setInitialMessage={setInitialMessage}
          handleRequest={handleRequest}
          isDisabled={false}
          placeholder={isPopoverOpen
            ? "Ask PearAI Creator to build anything! Currently works best with web applications."
            : "Ask PearAI Creator to add new features, fix bugs, and more to your current project!"}
          lockToWhite
          maxHeight="40vh"
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
              id: "new-project",
              icon: <FolderPlus className="size-4" />,
              label: "New Project",
              variant: "secondary",
              size: "sm",
              togglable: hasWorkspaceFolders,
              toggled: isPopoverOpen || !hasWorkspaceFolders,
              onToggle: (t) => hasWorkspaceFolders && setIsPopoverOpen(t),
            },
          ]}
          submitButton={{
            id: "submit",
            label: "Start",
            icon: <ArrowTurnDownLeftIcon className="size-4" />,
            variant: "default" as const,
            size: "default" as const,
            disabled: isPopoverOpen && !projectConfig.name.trim(),
          }}
        />
      </RGBWrapper>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isPopoverOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-4 mt-3">
          <div className="flex flex-col gap-5 p-5 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-foreground/90">Project Name:</label>
              <input
                ref={projectNameRef}
                type="text"
                value={projectConfig.name}
                onChange={handleProjectNameChange}
                placeholder="Enter project name"
                className="w-full px-4 py-2 text-sm border rounded-lg bg-background/80 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
              />
            </div>
            <div className="space-y-2.5">
              <button
                onClick={handleDirectorySelect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-background rounded-lg hover:bg-background/90 border border-border/50 transition-all duration-200"
              >
                <Pencil className="size-4" />
                Select Directory
              </button>
              <div className="text-sm text-muted-foreground/80 px-1">
                {projectConfig.path && `Selected: ${displayPath}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}