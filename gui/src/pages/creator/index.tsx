import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";
import { PlanEditor } from "./planEditor";
import { Ideation } from "./ui/ideation";
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext";
import ColorManager from "./ui/colorManager";
import {
  ChatMessage,
  MessageContent,
  ProcessLLMType,
  SubmitIdeaType,
  NewProjectType,
  MessagePart,
} from "core";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { getAnimationTargetHeightOffset } from "./utils";
import { AnimatePresence, motion } from "framer-motion";
import { PlanningBar } from "./ui/planningBar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import posthog from "posthog-js";

// Animation info stored in window to survive component remounts
if (typeof window !== "undefined") {
  window.__creatorOverlayAnimation = window.__creatorOverlayAnimation || {
    targetHeightOffset: undefined,
    timestamp: 0,
  };
}

type WebviewState = {
  webview: Partial<CSSStyleDeclaration>;
};

interface OverlayStates {
  loading: WebviewState;
  open: WebviewState;
  closed: WebviewState;
  overlay_closed_creator_active: WebviewState;
}

interface ProjectConfig {
  path: string;
  name: string;
  type: NewProjectType;
}

/**
 * CreatorOverlay component provides a full-screen overlay with an auto-focusing input field
 * for capturing user commands or queries.
 */
export const CreatorOverlay = () => {
  const [currentState, setCurrentState] = useState<
    "IDEATION" | "GENERATING" | "GENERATED"
  >("IDEATION");
  const [makeAPlan, setMakeAPlan] = useState<boolean>(false);
  const [overlayState, setOverlayState] =
    useState<keyof OverlayStates>("loading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const getImages = useCallback(() => {
    return Promise.all(
      files
        .filter((file) => {
          const [type, subtype] = file.type.split("/");
          return type === "image" && ["png", "jpeg", "webp"].includes(subtype);
        })
        .map(
          (file) =>
            new Promise<string | null>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.error) {
                  console.error("Error reading file:", reader.error);
                  resolve(null);
                } else {
                  const result = reader.result;
                  resolve(typeof result === "string" ? result : null);
                }
              };
              reader.readAsDataURL(file);
            }),
        ),
    ).then((results) =>
      results.filter((dataUrl): dataUrl is string => dataUrl !== null),
    );
  }, [files]);

  const [parentStyling, setParentStyling] = useState<
    Partial<CSSStyleDeclaration> | undefined
  >();
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    path: "~/Documents/PearAI", // TODO: FIX FOR WINDOWS MAYBE?
    name: uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: "lowerCase",
      separator: "-",
    }),
    type: "WEBAPP" as NewProjectType,
  });
  const ideMessenger = useContext(IdeMessengerContext);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const initialMessage: MessageContent = useMemo(() => {
    const msg = messages.find((x) => x.role === "user")?.content;

    // Handle the different possible content types
    if (typeof msg === "string") {
      return msg;
    } else if (Array.isArray(msg)) {
      // If it's an array of MessageParts, extract text parts
      return msg
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("");
    }
    return "";
  }, [messages]);

  // Keep animation state in a ref to prevent render cycles
  const animationRef = useRef(getAnimationTargetHeightOffset());

  // Force a rerender when animation changes
  const [, forceUpdate] = useState({});

  const { sendMessage, typedRegister, registerListener } = useMessaging();

  // Handle closing the overlay based on current state
  const close = useCallback(() => {
    if (overlayState === "open") {
      // If fully open, close the overlay but stay in creator mode
      sendMessage("Close");
    } else if (overlayState === "overlay_closed_creator_active") {
      // If in creator mode with minimized overlay, exit creator mode entirely
      sendMessage("Close");
    }
  }, [sendMessage, overlayState]);

  // Create a text-only MessageContent from a string
  const createTextContent = useCallback(
    (text: MessageContent): MessageContent => {
      // For simplicity, we'll use the string variant for most messages
      return text;

      // Alternative: return an array of MessageParts if we need to
      // return [{ type: "text", text }];
    },
    [],
  );

  const currentPlan = useMemo(() => {
    // Search through messages in reverse order to find the last plan
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i].content;

      // Handle different content types
      let content = "";
      if (typeof msg === "string") {
        content = msg;
      } else if (Array.isArray(msg)) {
        content = msg
          .filter((part) => part.type === "text" && part.text)
          .map((part) => part.text)
          .join("");
      }

      // Look for plan between ```plan and ``` markers
      const planMatch = content.match(/```plan\s*([\s\S]*?)\s*```/);
      if (planMatch) {
        return planMatch[1].trim();
      }
    }

    // if no ```plan is found, return the messages
    return messages
      .reduce((acc, msg) => {
        const content = msg.content;
        if (typeof content === "string") {
          return `${acc}, ${content}`;
        }
      }, "")
      .trim();
  }, [messages]);

  // Convenience function to update an existing assistant message or add a new one
  const updateAssistantMessage = useCallback(
    (content: string) => {
      const messageContent = createTextContent(content);

      setMessages((prev) => {
        // Find the last assistant message index without modifying the array
        const assistantIndex = (() => {
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].role === "assistant") {
              return i;
            }
          }
          return -1;
        })();

        if (assistantIndex === -1) {
          // No assistant message yet, add one
          return [...prev, { role: "assistant", content: messageContent }];
        } else {
          // Create a new array with the updated assistant message
          const newMessages = [...prev];
          newMessages[assistantIndex] = {
            ...newMessages[assistantIndex],
            content: messageContent,
          };
          return newMessages;
        }
      });
    },
    [createTextContent],
  );

  // Convenience function to update the initial user message
  const setInitialMessage = useCallback(
    (content: string) => {
      const messageContent = createTextContent(content);

      setMessages((prev) => {
        const firstUserIndex = prev.findIndex((msg) => msg.role === "user");
        if (firstUserIndex === -1) {
          return [{ role: "user", content: messageContent }, ...prev];
        } else {
          // Create a new array with the updated user message
          const newMessages = [...prev];
          newMessages[firstUserIndex] = {
            ...newMessages[firstUserIndex],
            content: messageContent,
          };
          return newMessages;
        }
      });
    },
    [createTextContent],
  );

  // Convenience function to add a new message
  const addMessage = useCallback(
    (role: "user" | "assistant", content: MessageContent, reset?: boolean) => {
      const messageContent: MessageContent = createTextContent(content);
      const newMsgs = [
        ...(reset ? [] : messages),
        { role, content: messageContent },
      ];
      setMessages(newMsgs);
      return newMsgs;
    },
    [createTextContent, messages, setMessages],
  );

  // Handle escape key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    typedRegister("planCreationStream", (msg) => {
      // Update messages with streaming content
      updateAssistantMessage(msg.data.plan);
    });

    typedRegister("planCreationCompleted", (msg) => {
      setCurrentState("GENERATED");
      // Finalize assistant message
      updateAssistantMessage(msg.data.plan);
    });
  }, [typedRegister, updateAssistantMessage]);

  // Helper function to extract text from MessageContent
  const getMessageText = useCallback((content: MessageContent): string => {
    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      return content
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("");
    }
    return "";
  }, []);

  const safePath = useMemo(() => {
    // Sanitize the project name by removing any path-traversal characters
    const safeName = projectConfig.name.trim().replace(/[/\\?%*:|"<>]/g, "-");
    // Handle path joining manually, ensuring no double slashes
    const safePath = projectConfig.path.endsWith("/")
      ? `${projectConfig.path}${safeName}`
      : `${projectConfig.path}/${safeName}`;

    return safePath;
  }, [projectConfig]);

  const handleSubmitRequest = useCallback(
    async (request: string, hasPlan: boolean = false) => {
      // Track analytics
      posthog.capture("creator_submit", {
        has_plan: hasPlan,
        project_name: projectConfig.name,
        initial_message: initialMessage,
        project_type: projectConfig.type,
        images_count: files.length,
      });

      // Prepare request with plan prefix if needed
      const finalRequest = hasPlan ? `PLAN: ${request}` : request;

      // Submit the request
      if (isCreatingProject) {
        if (!projectConfig.path || !projectConfig.name) {
          throw new Error(
            "Project path and name are required for project creation.",
          );
        }

        // Submit request with project path
        await sendMessage("SubmitIdea", {
          request: finalRequest,
          creatorMode: true,
          newProjectType: projectConfig.type,
          newProjectPath: safePath,
          images: await getImages(),
        } satisfies SubmitIdeaType["payload"]);

        // Replace workspace folder after submission
        ideMessenger
          .request("replaceWorkspaceFolder", {
            path: safePath,
          })
          .catch((e) => console.error(`ERROR MAKING FOLDER ${e}`));
      } else {
        // Submit request without project path
        await sendMessage("SubmitIdea", {
          request: finalRequest,
          creatorMode: true,
          newProjectType: "NONE",
          images: await getImages(),
        } satisfies SubmitIdeaType["payload"]);
      }
    },
    [
      ideMessenger,
      sendMessage,
      projectConfig,
      isCreatingProject,
      safePath,
      initialMessage,
      files.length,
      getImages,
    ],
  );

  const handleLlmCall = useCallback(
    async (givenMsgs?: ChatMessage[]) => {
      if (makeAPlan) {
        const images = await getImages();
        const imageParts: MessagePart[] = images.map((url) => ({
          type: "imageUrl",
          imageUrl: { url },
        }));

        let newGivenMsgs = givenMsgs ?? messages;

        // Add image parts to the first message's content if possible
        if (newGivenMsgs.length > 0) {
          const firstMsg = newGivenMsgs[0];
          let newContent: MessageContent;

          if (Array.isArray(firstMsg.content)) {
            // Already MessagePart[], append images
            newContent = [...firstMsg.content, ...imageParts];
          } else if (typeof firstMsg.content === "string") {
            // Convert string to MessagePart[], then append images
            newContent = [
              { type: "text", text: firstMsg.content },
              ...imageParts,
            ];
          } else {
            newContent = imageParts;
          }

          // Replace the first message with updated content
          newGivenMsgs = [
            { ...firstMsg, content: newContent },
            ...newGivenMsgs.slice(1),
          ];
        }

        setMessages((msgs) => [...msgs, { content: "", role: "assistant" }]);
        sendMessage("ProcessLLM", {
          messages: [
            {
              role: "system",
              content:
                "<PEARAI_CREATOR_WEBAPP_PLANNING_STEP></PEARAI_CREATOR_WEBAPP_PLANNING_STEP>",
            },
            ...newGivenMsgs,
          ] satisfies ProcessLLMType["payload"]["messages"],
          plan: true,
        } satisfies ProcessLLMType["payload"]);
        setCurrentState("GENERATING");
      } else {
        // Skip planning and submit directly
        const request = givenMsgs?.[0]?.content ?? initialMessage;
        handleSubmitRequest(getMessageText(request));
      }
    },
    [
      messages,
      sendMessage,
      setCurrentState,
      makeAPlan,
      initialMessage,
      handleSubmitRequest,
      getMessageText,
    ],
  );

  const handleMakeIt = useCallback(async () => {
    if (currentPlan) {
      await handleSubmitRequest(currentPlan, true);
    }
  }, [handleSubmitRequest, currentPlan]);

  const handleStateUpdate = useCallback(
    (msg: {
      data: { targetState: keyof OverlayStates; overlayStates: OverlayStates };
    }) => {
      if (!msg.data?.targetState || !msg.data?.overlayStates) return;

      const { targetState, overlayStates } = msg.data;
      const stateConfig = overlayStates[targetState];
      console.dir(`Target State: ${targetState}`);
      console.dir(JSON.stringify(overlayStates));

      const { webview } = stateConfig;
      setParentStyling(webview);
      setOverlayState(targetState);
    },
    [setParentStyling, setOverlayState],
  );

  // Animation handler - handles webview state transitions
  useEffect(() => {
    // Register handlerx
    const unregister = registerListener("stateUpdate", handleStateUpdate);

    return () => {
      unregister();
    };
  }, [registerListener, handleStateUpdate]);

  // useEffect(() => {
  //   console.dir("parentStyling UPDATE!!");
  //   console.dir(parentStyling);
  // }, [parentStyling]);

  // Send loaded message when component mounts
  useEffect(() => {
    setTimeout(() => {
      sendMessage("loaded");
    }, 100); // Small delay to ensure event handler is registered
  }, [sendMessage]);

  const handleIdeationRequest = useCallback(() => {
    handleLlmCall(addMessage("user", initialMessage, true));
  }, [safePath, initialMessage, isCreatingProject, handleLlmCall, addMessage]);

  return (
    <div className="w-full h-full">
      <ColorManager />
      <div
        onClick={close}
        // Kind of janky but the types are pretty similar so let's just keep an eye out here
        style={
          (parentStyling as unknown as React.CSSProperties) ?? {
            // TODO: fix this sync issue where we don't get the right starting values for the translate y offset from the app
            transform: "translateY(-100%)",
            transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
          }
        }
        className="all-initial fixed inset-0 items-center justify-center font[var(--vscode-font-family)] animate flex-col"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="justify-center align-middle m-auto w-full relative h-full flex flex-col"
        >
          <AnimatePresence initial={false}>
            {currentState === "IDEATION" ? (
              <div className="absolute w-full h-full flex justify-center align-middle">
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 1 }}
                  key="ideation"
                  className="m-auto w-full max-w-2xl"
                >
                  <Ideation
                    initialMessage={initialMessage}
                    setInitialMessage={setInitialMessage}
                    handleRequest={handleIdeationRequest}
                    className=""
                    projectConfig={projectConfig}
                    setProjectConfig={setProjectConfig}
                    makeAPlan={makeAPlan}
                    setMakeAPlan={setMakeAPlan}
                    isCreatingProject={isCreatingProject}
                    setIsCreatingProject={setIsCreatingProject}
                    files={files}
                    setFiles={setFiles}
                  />
                </motion.div>
              </div>
            ) : null}

            {(currentState === "GENERATING" ||
              currentState === "GENERATED") && (
              <>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{
                    duration: 0.3,
                    scaleX: { type: "spring", stiffness: 100, damping: 20 },
                  }}
                  key="planningBar"
                  className="origin-center flex justify-center align-middle w-full mt-8"
                >
                  <PlanningBar
                    requestedPlan={initialMessage}
                    isStreaming={currentState === "GENERATING"}
                    nextCallback={handleMakeIt}
                    className="max-w-2xl w-full m-auto"
                  />
                </motion.div>

                {/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}

                <div className="w-full h-full flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      scaleX: { type: "spring", stiffness: 100, damping: 20 },
                    }}
                    key="planEditor"
                    className="w-full max-w-2xl flex origin-center mb-12"
                  >
                    <PlanEditor
                      initialMessage={initialMessage}
                      handleUserChangeMessage={(msg: MessageContent) => {
                        handleLlmCall(addMessage("user", msg));
                      }}
                      isStreaming={currentState === "GENERATING"}
                      messages={messages}
                    />
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <div className="flex w-full justify-center align-middle mb-8">
            <Button
              variant="secondary"
              size="sm"
              className="cursor-pointer z-20"
              onClick={close}
            >
              <LogOut className="size-4" />
              Exit Creator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
