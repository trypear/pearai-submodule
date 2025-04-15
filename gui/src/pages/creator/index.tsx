import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlanEditor } from "./planEditor"
import { Ideation } from "./ui/ideation"
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import ColorManager from "./ui/colorManager"
import { ChatMessage, MessageContent, MessagePart } from "core";
import { getAnimationDirection, setAnimationDirection } from "./utils";

// Animation info stored in window to survive component remounts
if (typeof window !== 'undefined') {
    window.__creatorOverlayAnimation = window.__creatorOverlayAnimation || {
        direction: null,
        timestamp: 0
    };
}

type ExtensionMessage =
	| { data: { plan: string } }
	| { messageType: "planCreationSuccess" }
	| { messageType: "pearAiCloseCreatorInterface" }
	| { messageType: "pearAiHideCreatorLoadingOverlay" }
	| { messageType: "newCreatorModeTask"; text: string }
	| { messageType: "creatorModePlannedTaskSubmit"; text: string }
	| { messageType: "overlayAnimation"; data: { direction: "up" | "down" } };

/**
 * CreatorOverlay component provides a full-screen overlay with an auto-focusing input field
 * for capturing user commands or queries.
 */
export const CreatorOverlay = () => {
	const [currentState, setCurrentState] = useState<"IDEATION" | "GENERATING" | "GENERATED">("IDEATION")
	const [makeAPlan, setMakeAPlan] = useState<boolean>(true)

	const [messages, setMessages] = useState<ChatMessage[]>([
	]);

	const initialMessage = useMemo(() => {
		const msg = messages.find(x => x.role === "user")?.content;
		
		// Handle the different possible content types
		if (typeof msg === "string") {
			return msg;
		} else if (Array.isArray(msg)) {
			// If it's an array of MessageParts, extract text parts
			return msg
				.filter(part => part.type === "text" && part.text)
				.map(part => part.text)
				.join("");
		}
		return ""; 
	}, [messages]);

	// Keep animation state in a ref to prevent render cycles
	const animationRef = useRef(getAnimationDirection());

	// Force a rerender when animation changes 
	const [, forceUpdate] = useState({});

	const { sendMessage, typedRegister, registerListener } = useMessaging();

	// Whenever we close, the webview is reset so we don't have to worry about resetting states
	const close = useCallback(() => {
		sendMessage("Close");
	}, [sendMessage]);

	// Create a text-only MessageContent from a string
	const createTextContent = useCallback((text: string): MessageContent => {
		// For simplicity, we'll use the string variant for most messages
		return text;
		
		// Alternative: return an array of MessageParts if you need that format
		// return [{ type: "text", text }];
	}, []);

	// Convenience function to update an existing assistant message or add a new one
	const updateAssistantMessage = useCallback((content: string) => {
		const messageContent = createTextContent(content);
		
		setMessages(prev => {
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
			newMessages[assistantIndex] = { ...newMessages[assistantIndex], content: messageContent };
			return newMessages;
		  }
		});
	  }, [createTextContent]);

	// Convenience function to update the initial user message
	const setInitialMessage = useCallback((content: string) => {
		const messageContent = createTextContent(content);
		
		setMessages(prev => {
			const firstUserIndex = prev.findIndex(msg => msg.role === "user");
			if (firstUserIndex === -1) {
				return [{ role: "user", content: messageContent }, ...prev];
			} else {
				// Create a new array with the updated user message
				const newMessages = [...prev];
				newMessages[firstUserIndex] = { ...newMessages[firstUserIndex], content: messageContent };
				return newMessages;
			}
		});
	}, [createTextContent]);

	// Convenience function to add a new message
	const addMessage = useCallback((role: "user" | "assistant", content: string, reset?: boolean) => {
		const messageContent = createTextContent(content);
		setMessages(prev => [...(reset ? [] : prev), { role, content: messageContent }]);
	}, [createTextContent]);

	// Handle escape key globally
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				close()
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
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

	const handleLlmCall = useCallback(async () => {
		setMessages((msgs) => [...msgs, { content: "", role: "assistant"}])
		sendMessage("ProcessLLM", {
			messages,
			plan: true,
		});
		setCurrentState("GENERATING");
	}, [messages, sendMessage, setCurrentState]);

	const handleMakeIt = useCallback(async () => {
		// TODO: EXTRACT THE PLAN FROM THE CHAT
		// await sendMessage("SubmitPlan", {
		// 	plan: `PLAN: ${newProjectPlan}`
		// });
		close();// TODO: close the overlay but stay in creator mode
	}, [sendMessage, close]);

	const handleUserChangeMessage = useCallback((userMessage: ChatMessage) => {
		setMessages((msgs) => [...msgs, userMessage])
	}, [setCurrentState]);

	// Animation handler - directly manipulates the DOM element to ensure
	// animation works even if component remounts
	useEffect(() => {
		const handleAnimation = (msg) => { // TODO: TYPES
			if (!msg.data?.direction) return;

			const newDirection = msg.data.direction;
			// Store direction in window for persistence
			setAnimationDirection(newDirection);

			// Update our ref
			animationRef.current = newDirection;

			// Force a rerender
			forceUpdate({});

			// Direct DOM manipulation as fallback
			try {
				// Find the main animation container in DOM
				const container = document.querySelector('.all-initial.fixed.inset-0');
				if (container && container instanceof HTMLElement) {
					container.style.transform = newDirection === 'down' ? 'translateY(0)' : 'translateY(-100%)';
				}
			} catch (e) {
				console.error('Failed to update DOM directly:', e);
			}
		};

		// Register handler
		const unregister = registerListener("overlayAnimation", handleAnimation);

		return () => {
			if (typeof unregister === 'function') {
				unregister();
			}
		};
	}, [registerListener]);

	// Send loaded message when component mounts
	useEffect(() => {
		setTimeout(() => {
			sendMessage("loaded");
		}, 100); // Small delay to ensure event handler is registered
	}, [sendMessage]);

	// Use inline style instead of useMemo to ensure it's always up-to-date
	const getTransformStyle = () => {
		const direction = getAnimationDirection();
		return {
			transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
			transform: direction === 'down' ? 'translateY(0)' : 'translateY(-100%)'
		};
	};

	return (
		<div className="w-full h-full" data-animation-direction={getAnimationDirection()}>
			<ColorManager />
			<div
				onClick={close}
				style={getTransformStyle()}
				className="all-initial fixed inset-0 flex items-center justify-center bg-transparent font[var(--vscode-font-family)] animate flex-col"
			>
				<div
					onClick={(e) => e.stopPropagation()}
					className="justify-center align-middle m-auto w-full max-w-2xl flex flex-col h-full"
				>
					{currentState === "IDEATION" && (
						<Ideation
							initialMessage={initialMessage}
							setInitialMessage={setInitialMessage}
							handleRequest={() => {
								addMessage("user", initialMessage, true)
								handleLlmCall()
							}}
							makeAPlan={makeAPlan}
							setMakeAPlan={setMakeAPlan}
						/>
					)}

					{/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}
					{(currentState === "GENERATING" || currentState === "GENERATED") && (
						<PlanEditor
							initialMessage={initialMessage}
							handleUserChangeMessage={(msg: string) => {
								addMessage("user", msg)
								handleLlmCall()
							}}
							isStreaming={currentState === "GENERATING"}
							handleMakeIt={handleMakeIt}
							messages={messages}
						/>
					)}
				</div>
				<Button variant="secondary" size="sm" className="mb-8 cursor-pointer mt-4" onClick={close}>
					<LogOut className="size-4" />
					Exit Creator
				</Button>
			</div>
		</div>
	)
}