import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { InputBox } from "./inputBox"
import StyledMarkdownPreview from "../../components/markdown/StyledMarkdownPreview"
import { ArrowTurnDownLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { ChatMessage, MessageContent } from "core"
import { Dot, DotsContainer } from "@/components/mainInput/ContinueInputBox"

interface PlanEditorProps {
  initialMessage: string
  isStreaming: boolean
  messages: ChatMessage[]
  handleUserChangeMessage: (m: string) => void;
}

// Helper function to extract text content from a message
const getMessageText = (content: MessageContent): string => {
  if (typeof content === "string") {
    return content
  } else if (Array.isArray(content)) {
    return content
      .filter(part => part.type === "text" && part.text)
      .map(part => part.text)
      .join("")
  }
  return ""
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
  isStreaming,
  initialMessage,
  handleUserChangeMessage,
  messages,
}) => {
  const planContainerRef = useRef<HTMLDivElement>(null)
  const editMessageTextAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [message, setMessage] = useState<string>("")
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Track if user is at the bottom
  const [isAtBottom, setIsAtBottom] = useState(true)
  // Track if there are new messages not in view
  const [hasNewMessages, setHasNewMessages] = useState(false)
  // Track if this is the initial streaming of a message
  const [isInitialStreaming, setIsInitialStreaming] = useState(false)
  // Store previous streaming state to detect changes
  const prevStreamingRef = useRef(isStreaming)
  // Store previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length)

  // Filter out the initial user message and process the remaining messages
  const displayMessages = useMemo(() => {
    // Skip the first user message as it's already shown in the PlanningBar
    if (messages.length <= 1) return []

    // Start from the second message (index 1)
    return messages.slice(1).map(msg => ({
      role: msg.role,
      content: getMessageText(msg.content),
      isLatestAssistant: msg.role === "assistant" &&
        messages.findIndex(m => m.role === "assistant") === messages.indexOf(msg)
    }))
  }, [messages])

  // Handle user edits through the input box
  const handleUserEdit = useCallback((userInput: string) => {
    handleUserChangeMessage(userInput)
    setMessage("")
    // When user sends a message, ensure we're at the bottom
    setIsAtBottom(true)
  }, [handleUserChangeMessage])

  // Detect start of streaming
  useEffect(() => {
    // If streaming just started
    if (isStreaming && !prevStreamingRef.current) {
      setIsInitialStreaming(true)
    } else if (!isStreaming) {
      // Reset when streaming stops
      setIsInitialStreaming(false)
    }

    // Update previous streaming state
    prevStreamingRef.current = isStreaming
  }, [isStreaming])

  // Set up intersection observer to detect when user is at the bottom
  useEffect(() => {
    if (!scrollElementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update isAtBottom state based on intersection
        setIsAtBottom(entry.isIntersecting)

        // If we see the bottom, clear the new messages indicator
        if (entry.isIntersecting) {
          setHasNewMessages(false)
        }
      },
      {
        root: planContainerRef.current,
        // Use a lower threshold - 0.1 means it triggers when just 10% is visible
        threshold: 0.1
      }
    )

    observer.observe(scrollElementRef.current)

    return () => {
      if (scrollElementRef.current) {
        observer.unobserve(scrollElementRef.current)
      }
    }
  }, [])

  // Auto-scroll to bottom only when appropriate
  useEffect(() => {
    // Skip if no messages or container
    if (displayMessages.length === 0 || !scrollElementRef.current) return

    const latestMessage = displayMessages[displayMessages.length - 1]

    // Detect if new message arrived
    const newMessageArrived = messages.length > prevMessageCountRef.current
    prevMessageCountRef.current = messages.length

    // Auto-scroll ONLY IF:
    // 1. User was already at the bottom, OR
    // 2. The latest message is from the user, OR
    // 3. ONLY the FIRST chunk of a streaming message (isInitialStreaming)
    if (isAtBottom || latestMessage.role === "user" || isInitialStreaming) {
      scrollElementRef.current.scrollIntoView({ behavior: "smooth" })

      // Reset initial streaming flag after first scroll
      if (isInitialStreaming) {
        setIsInitialStreaming(false)
      }
    } else if (newMessageArrived || (isStreaming && !isInitialStreaming)) {
      // If there's ongoing streaming or new message but we don't auto-scroll,
      // show the new message indicator
      setHasNewMessages(true)
    }
  }, [displayMessages, isAtBottom, isStreaming, isInitialStreaming, messages.length])

  // Function to manually scroll to bottom when button is clicked
  const scrollToBottom = () => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4">
      <div className="flex flex-col gap-4 min-h-0 flex-1">

        <div
          className="rounded-lg p-4 overflow-auto flex-1 relative"
          style={{
            scrollBehavior: 'smooth'
          }}
          ref={planContainerRef}
        >
          <div className="absolute inset-0 overflow-y-auto px-4">
            {displayMessages.length > 0 ? (
              <div className="flex flex-col relative pb-12">
                {displayMessages.map((msg, index, msgs) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.role === "user" ? "border-2 border-white" : ""}`}
                  >
                    <div className="text-xs text-[var(--foreground)] opacity-70 mb-1 flex justify-start gap-4">
                      <span className="text-nowrap">{msg.role === "assistant" ? "PearAI Creator" : "You"}</span>
                      {
                        // Show loading dots for the latest assistant message when it's empty and streaming
                        isStreaming &&
                        msg.role === "assistant" &&
                        msg.content === "" &&
                        index === msgs.length - 1 && (
                          <DotsContainer>
                            {[0, 1, 2].map((i) => (
                              <Dot key={i} delay={i * 0.2} />
                            ))}
                          </DotsContainer>
                        )
                      }
                    </div>
                    <StyledMarkdownPreview
                      source={msg.content}
                      showCodeBorder={true}
                      isStreaming={isStreaming && msg.role === "assistant" && msg.isLatestAssistant}
                      isLast={index === displayMessages.length - 1}
                      hideBackground={true}
                      toolbarOptions={{
                        copy: true,
                        copyAndReturn: true,
                        insertAtCursor: false,
                        runInTerminal: false,
                        fastApply: false,
                      }}
                      onBlockEditClick={(e) => setMessage((m) => `${m}\n\n${e}`)}
                    />
                  </div>
                ))}

                {/* Absolutely positioned, invisible scroll marker */}
                <div
                  ref={scrollElementRef}
                  data-testid="scroll-marker"
                  aria-hidden="true"
                  className="absolute bottom-0 w-[1px] -z-10 pointer-events-none opacity-0 h-40"
                />
              </div>
            ) : (
              <div className="text-[var(--widgetForeground)]">
                Project plan is generating...
              </div>
            )}
          </div>

          {/* New message indicator button - only show when not at bottom and have new messages */}
          {hasNewMessages && !isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-[var(--buttonBackground)] text-[var(--buttonForeground)] hover:bg-[var(--buttonHoverBackground)] p-2 rounded-full shadow-lg flex items-center justify-center z-10 transition-colors"
              aria-label="Scroll to new messages"
            >
              <ChevronDownIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
      <div className="bg-[var(--widgetBackground)] rounded-lg mt-4">
        <InputBox
          textareaRef={editMessageTextAreaRef}
          handleRequest={() => handleUserEdit(message)}
          setInitialMessage={setMessage}
          initialMessage={message}
          isDisabled={isStreaming}
          placeholder="Add a message or propose a change"
          initialRows={4}
          submitButton={{
            id: "submit",
            label: "Send",
            icon: <ArrowTurnDownLeftIcon className="size-4" />,
            variant: "default" as const,
            size: "default" as const,
          }}
          showBorder
        />
      </div>
    </div>
  )
}