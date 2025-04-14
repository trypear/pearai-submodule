import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlanningBar } from "./ui/planningBar"
import { InputBox } from "./inputBox"
import StyledMarkdownPreview from "../../components/markdown/StyledMarkdownPreview"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import { ChatMessage, MessageContent, MessagePart } from "core"

interface PlanEditorProps {
  initialMessage: string
  isStreaming: boolean
  handleMakeIt: () => void
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
  handleMakeIt,
  messages,
}) => {
  const planContainerRef = useRef<HTMLDivElement>(null)
  const editMessageTextAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [message, setMessage] = useState<string>("")
  const scrollElementRef = useRef<HTMLDivElement>(null)

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
	
  }, [handleUserChangeMessage])

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4">
      <div className="flex flex-col gap-4 min-h-0 flex-1">
        <PlanningBar 
          isGenerating={isStreaming} 
          requestedPlan={initialMessage} 
          playCallback={handleMakeIt} 
          nextCallback={handleMakeIt} 
        />
        <div
          className="rounded-lg p-4 overflow-auto flex-1 relative"
          style={{
            scrollBehavior: 'smooth'
          }}
          ref={planContainerRef}
        >
          <div className="absolute inset-0 overflow-y-auto px-4">
            {displayMessages.length > 0 ? (
              <div className="flex flex-col gap-6">
                {displayMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col ${msg.role === "assistant" ? "" : "pl-8"}`}
                  >
                    <div className="text-xs text-[var(--foreground)] opacity-70 mb-1">
                      {msg.role === "assistant" ? "AI Assistant" : "You"}
                    </div>
                    <StyledMarkdownPreview
                      source={
                        // For the latest assistant message, show newProjectPlan if it exists
						msg.content
                      }
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
              </div>
            ) : (
              <div className="text-[var(--widgetForeground)]">
                Project plan is generating...
              </div>
            )}

			<div className="size-0" ref={scrollElementRef} />
          </div>
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