import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { RGBWrapper } from "../rgbBackground";
import { InputBox } from "../inputBox";
import { PearIcon } from "./pearIcon";
import { Bot, FileText, FolderPlus, Pencil } from "lucide-react";
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { ButtonID } from "../utils";
import { Folder, Tag, Monitor, Smartphone, Box } from "lucide-react";
import { ProjectTypeButton } from "./projectTypeButton";
import type { NewProjectType } from "core";
import posthog from "posthog-js";
import { ComingSoonFeedback } from "./comingSoonFeedback";
import { CubeIcon } from "@radix-ui/react-icons";
interface ProjectConfig {
  path: string;
  name: string;
  type: NewProjectType;
}

interface IdeationProps {
  initialMessage: string;
  setInitialMessage: (message: string | ((prevText: string) => string)) => void;
  handleRequest: () => void;
  makeAPlan: boolean;
  setMakeAPlan: (value: boolean) => void;
  className?: string;
  projectConfig: ProjectConfig;
  setProjectConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>;
  isCreatingProject: boolean;
  setIsCreatingProject: React.Dispatch<React.SetStateAction<boolean>>;
  files: File[];
  setFiles: (files: File[]) => void;
}

export const Ideation: React.FC<IdeationProps> = ({
  initialMessage,
  setInitialMessage,
  handleRequest,
  makeAPlan,
  setMakeAPlan,
  className,
  projectConfig,
  setProjectConfig,
  isCreatingProject,
  setIsCreatingProject,
  files,
  setFiles,
}) => {
  const ideaTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const projectNameRef = useRef<HTMLInputElement | null>(null);
  const isCapturingRef = useRef(false);
  const ideMessenger = useContext(IdeMessengerContext);
  const [hasWorkspacePaths, setHasWorkspacePaths] = useState(false);

  useEffect(() => {
    posthog.capture("creator_opened");

    const callback = async () => {
      const workspacePaths = await ideMessenger.request(
        "getWorkspacePaths",
        undefined,
      );
      setHasWorkspacePaths(workspacePaths.length > 0);
    };

    void callback();
  }, []);

  useEffect(() => {
    setIsCreatingProject(!hasWorkspacePaths);
  }, [hasWorkspacePaths, setIsCreatingProject]);

  // Focus project name input when popover opens
  useEffect(() => {
    if (isCreatingProject && projectNameRef.current) {
      projectNameRef.current.focus();
    }
  }, [isCreatingProject]);

  const forceFocus = useCallback(() => {
    if (!ideaTextAreaRef.current) return;

    try {
      ideaTextAreaRef.current.focus();
      ideaTextAreaRef.current.focus({ preventScroll: false });
      ideaTextAreaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } catch (e) {
      console.error("Focus attempt failed:", e);
    }
  }, []);

  useEffect(() => {
    forceFocus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture keystrokes if not focused on any textarea
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }

      // Handle single character keystrokes
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        forceFocus();

        if (!isCapturingRef.current) {
          setInitialMessage((prevText) => prevText + e.key);
          isCapturingRef.current = true;

          setTimeout(() => {
            isCapturingRef.current = false;
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [forceFocus, setInitialMessage]);

  const handleDirectorySelect = useCallback(async () => {
    console.log(
      "handleDirectorySelect called with projectName:",
      projectConfig.name,
    );
    try {
      const response = await ideMessenger.request("pearSelectFolder", {
        openLabel: "Select",
      });

      if (response && typeof response === "string") {
        const dirName = response;
        // Use default if name is empty or just whitespace
        console.dir("DIR IN HANDLE DIRECTORY SELECT:");
        console.dir(dirName);
        console.dir(projectConfig.name);
        const projectName = projectConfig.name.trim() || "default";
        setProjectConfig((prev) => ({
          ...prev,
          name: projectName,
          path: dirName,
        }));
      }
    } catch (err) {
      console.error("Failed to select directory:", err);
    }
  }, [ideMessenger, projectConfig.name, setProjectConfig]);

  // Display just the main folder name, as the path is usually extremely long
  const displayPath =
    (projectConfig.path.includes("~")
      ? projectConfig.path
      : projectConfig.path.split(/[/\\]/).pop()) + "/";

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectConfig((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleProjectTypeChange = (type: NewProjectType) => {
    setProjectConfig((prev) => ({
      ...prev,
      type,
    }));
  };
  return (
    <div className={cn("flex gap-4 flex-col min-w-[600px]", className)}>
      <div className="flex justify-center align-middle text-[var(--focusBorder)] w-full gap-2 text-md animate transition-opacity relative">
        <PearIcon className="my-auto size-7" />
        <div className="my-auto font-semibold text-2xl">
          {/* {isCreatingProject ? "What would you like to make?" : "What would you like to do?"} */}
          PearAI Creator
        </div>
        {/* <div>beta</div> */}
        <div
          className={`absolute -right-0 top-[6px] bg-white text-black rounded-md px-1.5 py-1 text-[11px] tracking-wide uppercase`}
        >
          Beta
        </div>
      </div>
      <RGBWrapper className="my-auto w-full">
        <InputBox
          textareaRef={ideaTextAreaRef}
          fileUpload={{
            files,
            setFiles,
            fileTypes: ["image/*"],
            maxFileSize: 10 * 1024 * 1024, // 10MB
          }}
          initialMessage={initialMessage}
          initialRows={2}
          setInitialMessage={setInitialMessage}
          handleRequest={handleRequest}
          isDisabled={false}
          placeholder={
            isCreatingProject
              ? "What would you like to make? PearAI Creator will start your project off with strong foundations - currently works best with web applications."
              : "Ask PearAI Creator to add new features, fix bugs, and more to your current project!"
          }
          lockToWhite
          maxHeight="40vh"
          leftButtons={[
            {
              id: ButtonID.NEW_PROJECT,
              icon: (
                <FolderPlus
                  className={`${
                    isCreatingProject ? "text-blue-500" : "text-gray-400"
                  }`}
                />
              ),
              label: "New Project",
              variant: "secondary",
              size: "sm",
              togglable: true,
              disabled: !hasWorkspacePaths,
              toggled: isCreatingProject,
              onToggle: (t) => setIsCreatingProject(t),
            },
            ...(isCreatingProject
              ? [
                  {
                    id: ButtonID.MAKE_PLAN,
                    icon: (
                      <FileText
                        className={`${
                          makeAPlan ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    ),
                    label: "Make a plan",
                    togglable: true,
                    variant: "secondary" as const,
                    size: "sm" as const,
                    toggled: makeAPlan,
                    onToggle: (t) => setMakeAPlan(t),
                  },
                ]
              : []),
          ]}
          submitButton={{
            id: ButtonID.SUBMIT,
            label: "Start",
            icon: (
              <ArrowTurnDownLeftIcon
                style={{ width: "13px", height: "13px" }}
              />
            ),
            variant: "default",
            size: "sm",
            disabled: isCreatingProject && !projectConfig.name.trim(),
          }}
          className="rounded-b-0"
          disabled={projectConfig.type !== "WEBAPP"}
        />
        <div
          className={cn(
            "overflow-hidden rounded-b-xl border-solid border-b-0  border-l-0 border-r-0 border-t-1 border-gray-300 transition-all duration-300 ease-out",
            isCreatingProject
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0",
          )}
          style={{
            // backgroundColor: 'var(--widgetBackground)',
            backgroundColor: "white",
          }}
        >
          <div className="flex flex-col text-xs gap-2 p-3 bg-background/50 backdrop-blur-sm rounded-lg">
            <div className="space-y-2.5">
              <label className="font-medium text-black">Project Type</label>
              <br />
              <div className="grid grid-cols-4 gap-4">
                <ProjectTypeButton
                  type="WEBAPP"
                  label="Web App"
                  icon={<Monitor className="size-6" />}
                  selected={projectConfig.type === "WEBAPP"}
                  onClick={handleProjectTypeChange}
                />
                <ProjectTypeButton
                  type="AIAPP"
                  label="AI App"
                  icon={<Bot className="size-6" />}
                  selected={projectConfig.type === "AIAPP"}
                  onClick={handleProjectTypeChange}
                />
                <ProjectTypeButton
                  type="MOBILE"
                  label="Mobile"
                  icon={<Smartphone className="size-6" />}
                  selected={projectConfig.type === "MOBILE"}
                  onClick={handleProjectTypeChange}
                />
                <ProjectTypeButton
                  type="OTHER"
                  label="Other"
                  icon={<CubeIcon className="size-6" />}
                  selected={projectConfig.type === "OTHER"}
                  onClick={handleProjectTypeChange}
                />
              </div>
            </div>
            <ComingSoonFeedback
              show={projectConfig.type !== "WEBAPP"}
              projectType={projectConfig.type}
            />

            <div className="space-y-2.5">
              <label className="font-medium text-black">Project Name</label>
              <br />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-solid border-gray-300 p-1.5 w-fit cursor-pointer ">
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
              <div
                className="flex items-center gap-2 rounded-lg border border-solid border-gray-300 p-1.5 w-fit cursor-pointer "
                onClick={handleDirectorySelect}
              >
                <Folder className="size-4 text-black" />
                <div className="text-black">
                  {projectConfig.path && `${displayPath}`}
                </div>
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
  );
};
