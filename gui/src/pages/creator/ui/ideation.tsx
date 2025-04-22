import { useCallback, useEffect, useRef, useState, useContext } from "react"
import { RGBWrapper } from "../rgbBackground"
import { InputBox } from "../inputBox"
import { PearIcon } from "./pearIcon"
import { FileText, FolderPlus, Pencil } from "lucide-react"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { IdeMessengerContext } from "../../../context/IdeMessenger"
import { ButtonID } from "../utils"
import { Folder, Tag } from "lucide-react"
import { LightbulbIcon } from "lucide-react"
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
      setProjectConfig(prev => ({
        ...prev,
        path: "~/pearai-projects",
        name: "default"
      }));
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
  const displayPath = (projectConfig.path.includes('~') ? projectConfig.path : projectConfig.path.split(/[/\\]/).pop()) + "/";

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  return (
    <div className={cn("flex gap-4 flex-col border border-solidd border-red-500 min-w-[600px]", className)}>
      <div className="flex justify-center align-middle text-[var(--focusBorder)] w-full gap-2 text-md animate transition-opacity">
        <PearIcon className="my-auto size-7" />
        <div className="my-auto font-semibold text-2xl">
          {/* {isPopoverOpen ? "What would you like to make?" : "What would you like to do?"} */}
          PearAI Creator
        </div>
      </div>
      <RGBWrapper className="my-auto w-full">
        <InputBox
          textareaRef={textareaRef}
          initialMessage={initialMessage}
          initialRows={0}
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
              id: ButtonID.NEW_PROJECT,
              icon: <FolderPlus className={`${isPopoverOpen ? "text-blue-500" : "text-gray-400"}`} />,
              label: "New Project",
              variant: "secondary",
              size: "sm",
              togglable: hasWorkspaceFolders,
              toggled: isPopoverOpen || !hasWorkspaceFolders,
              onToggle: (t) => hasWorkspaceFolders && setIsPopoverOpen(t),
            },
            ...(isPopoverOpen || !hasWorkspaceFolders ? [{
              id: ButtonID.MAKE_PLAN,
              icon: <FileText className={`${makeAPlan ? "text-blue-500" : "text-gray-400"}`} />,
              label: "Make a plan",
              togglable: true,
              variant: "secondary" as const,
              size: "sm" as const,
              toggled: makeAPlan,
              onToggle: (t) => setMakeAPlan(t),
            }] : []),
          ]}
          submitButton={{
            id: ButtonID.SUBMIT,
            label: "Start",
            icon: <ArrowTurnDownLeftIcon style={{ width: "13px", height: "13px" }} />,
            variant: "default",
            size: "sm",
            disabled: isPopoverOpen && !projectConfig.name.trim(),
          }}
        />
        <div
          className={cn(
            "overflow-hidden rounded-b-xl border-solid border-b-0  border-l-0 border-r-0 border-t-1 border-gray-300 transition-all duration-300 ease-out",
            isPopoverOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
          )}
          style={
            {
              // backgroundColor: 'var(--widgetBackground)',
              backgroundColor: 'white',
            }
          }
        >
          <div className="flex flex-col text-xs gap-2 p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-solidd border-red-500">
           <div className="space-y-2.5">
             <label className="font-medium text-black">Project Name</label>
             <br />
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 rounded-lg border border-solid border-gray-300 p-1.5 w-fit cursor-pointer "
               >
                 <Tag className="size-4 text-black" />
                 <div className="text-black">
                   <input
                     type="text"
                     placeholder="Project Name"
                     className="w-full bg-transparent outline-none border-none focus:outline-none"
                     value={projectConfig.name}
                     onChange={handleProjectNameChange}
                   />
                 </div>
               </div>
             </div>
           </div>
           <div className="space-y-2.5">
             <label className="font-medium text-black">Directory</label>
             <br />
             <div className="flex items-center gap-2 rounded-lg border border-solid border-gray-300 p-1.5 w-fit cursor-pointer "
               onClick={handleDirectorySelect}
             >
               <Folder className="size-4 text-black" />
               <div className="text-black">{projectConfig.path && `${displayPath}`}</div>
             </div>
           </div>
           {/* <div className="flex items-center gap-2 rounded-lg border border-solid border-gray-300 p-1.5 w-fit cursor-pointer text-black"
           // onClick={handleProjectNameSuggestion} // Use the suggested project name by ai.
           >
             <LightbulbIcon className="size-4" />
             <div className="text-black">
               ai suggested project name
             </div>
           </div> */}
           <div className="text-xs text-black">
             {projectConfig.path}/{projectConfig.name}
           </div>
          </div>
        </div>
      </RGBWrapper>
    </div>
  )
}