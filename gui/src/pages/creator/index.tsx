import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlanEditor } from "./planEditor"
import { Ideation } from "./ui/ideation"
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext"
import ColorManager from "./ui/colorManager"
import { ChatMessage, MessageContent, MessagePart } from "core";
import { getAnimationTargetHeightOffset, setAnimationTargetHeightOffset } from "./utils";
import { AnimatePresence, motion } from "framer-motion";
import { PlanningBar } from "./ui/planningBar"
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

// Animation info stored in window to survive component remounts
if (typeof window !== 'undefined') {
	window.__creatorOverlayAnimation = window.__creatorOverlayAnimation || {
		targetHeightOffset: undefined,
		timestamp: 0
	};
}

type WebviewState = {
	webview: Partial<CSSStyleDeclaration>;
}

interface OverlayStates {
	loading: WebviewState;
	open: WebviewState;
	closed: WebviewState;
	overlay_closed_creator_active: WebviewState;
}

type ExtensionMessage =
	| { data: { plan: string } }
	| { messageType: "planCreationSuccess" }
	| { messageType: "pearAiCloseCreatorInterface" }
	| { messageType: "pearAiHideCreatorLoadingOverlay" }
	| { messageType: "newCreatorModeTask"; text: string }
	| { messageType: "creatorModePlannedTaskSubmit"; text: string }
	| { messageType: "overlayAnimation"; data: { targetState: keyof OverlayStates; overlayStates: OverlayStates } };

/**
 * CreatorOverlay component provides a full-screen overlay with an auto-focusing input field
 * for capturing user commands or queries.
 */
export const CreatorOverlay = () => {
	const [currentState, setCurrentState] = useState<"IDEATION" | "GENERATING" | "GENERATED">("IDEATION");
	const [makeAPlan, setMakeAPlan] = useState<boolean>(true);
	const [overlayState, setOverlayState] = useState<keyof OverlayStates>("loading");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [parentStyling, setParentStyling] = useState<Partial<CSSStyleDeclaration> | undefined>();

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
	const createTextContent = useCallback((text: string): MessageContent => {
		// For simplicity, we'll use the string variant for most messages
		return text;

		// Alternative: return an array of MessageParts if we need to
		// return [{ type: "text", text }];
	}, []);

	const currentPlan = useMemo(() => {
		// Search through messages in reverse order to find the last plan
		for (let i = messages.length - 1; i >= 0; i--) {
			const msg = messages[i].content;

			// Handle different content types
			let content = '';
			if (typeof msg === 'string') {
				content = msg;
			} else if (Array.isArray(msg)) {
				content = msg
					.filter(part => part.type === 'text' && part.text)
					.map(part => part.text)
					.join('');
			}

			// Look for plan between ```plan and ``` markers
			const planMatch = content.match(/```plan\s*([\s\S]*?)\s*```/);
			if (planMatch) {
				return planMatch[1].trim();
			}
		}
		return undefined;
	}, [messages]);

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
		const newMsgs = [...(reset ? [] : messages), { role, content: messageContent }]
		setMessages(newMsgs);
		return newMsgs;
	}, [createTextContent, messages, setMessages]);

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

	const handleLlmCall = useCallback(async (givenMsgs?: ChatMessage[]) => {
		setMessages((msgs) => [...msgs, { content: "", role: "assistant" }])
		sendMessage("ProcessLLM", {
			messages: givenMsgs ?? messages,
			plan: true,
		});
		setCurrentState("GENERATING");
	}, [messages, sendMessage, setCurrentState]);

	const handleMakeIt = useCallback(async () => {
		if (currentPlan) {
			await sendMessage("SubmitPlan", {
				plan: `PLAN: ${currentPlan}`
			});
		}
	}, [sendMessage, close, currentPlan]);

	const handleUserChangeMessage = useCallback((userMessage: ChatMessage) => {
		setMessages((msgs) => [...msgs, userMessage])
	}, [setCurrentState]);

	const handleStateUpdate = useCallback((msg: { data: { targetState: keyof OverlayStates; overlayStates: OverlayStates } }) => {
		if (!msg.data?.targetState || !msg.data?.overlayStates) return;

		const { targetState, overlayStates } = msg.data;
		const stateConfig = overlayStates[targetState];
		console.dir(`Target State: ${targetState}`)
		console.dir(JSON.stringify(overlayStates));

		const { webview } = stateConfig;
		setParentStyling(webview);
		setOverlayState(targetState);
	}, [setParentStyling, setOverlayState]);


	// Animation handler - handles webview state transitions
	useEffect(() => {
		// Register handlerx
		const unregister = registerListener("stateUpdate", handleStateUpdate);

		return () => {
			unregister();
		};
	}, [registerListener, handleStateUpdate]);

	useEffect(() => {
		console.dir("parentStyling UPDATE!!");
		console.dir(parentStyling);
	}, [parentStyling])

	// Send loaded message when component mounts
	useEffect(() => {
		setTimeout(() => {
			sendMessage("loaded");
		}, 100); // Small delay to ensure event handler is registered
	}, [sendMessage]);

	return (
		<div className="w-full h-full">
			<ColorManager />
			<div
				onClick={close}
				// Kind of janky but the types are pretty similar so let's just keep an eye out here
				style={parentStyling as unknown as React.CSSProperties ?? {
					transform: "translateY(-100%)",
					transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
				}}
				className="all-initial fixed inset-0 items-center justify-center bg-transparent font[var(--vscode-font-family)] animate flex-col"
			>
				<div
					onClick={(e) => e.stopPropagation()}
					className="justify-center align-middle m-auto w-full relative h-full"
				>
					<div className="absolute w-full h-full flex justify-center align-middle">
						<AnimatePresence initial={false}>
							{currentState === "IDEATION" ? (
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
										handleRequest={() => {
											handleLlmCall(addMessage("user", initialMessage, true))
										}}
										makeAPlan={makeAPlan}
										setMakeAPlan={setMakeAPlan}
										className=""
									/>
								</motion.div>
							) : null}

						</AnimatePresence>
					</div>

					<AnimatePresence initial={false}>
						{(currentState === "GENERATING" || currentState === "GENERATED") && (
							<><motion.div
								initial={{ opacity: 0, scaleX: 0 }}
								animate={{ opacity: 1, scaleX: 1 }}
								exit={{ opacity: 0, scaleX: 0 }}
								transition={{
									duration: 0.4,
									scaleX: { type: "spring", stiffness: 100, damping: 20 }
								}}
								key="planningBar"
								className="origin-center flex justify-center align-middle w-full mt-8"
							>
								<PlanningBar
									requestedPlan={initialMessage}
									isGenerating={currentState === "GENERATING"}
									nextCallback={handleMakeIt}
									className="max-w-2xl w-full m-auto"
								/>
							</motion.div>

								{/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}

								<div className="absolute w-full h-full flex justify-center">

									<motion.div
										initial={{ opacity: 0, y: 20, scaleX: 0 }}
										animate={{ opacity: 1, y: 0, scaleX: 1 }}
										exit={{ opacity: 0, y: 20, scaleX: 0 }}
										transition={{
											duration: 0.4,
											scaleX: { type: "spring", stiffness: 100, damping: 20 }
										}}
										key="planEditor"
										className="w-full max-w-2xl flex origin-center h-[90vh]"
									>
										<PlanEditor
											initialMessage={initialMessage}
											handleUserChangeMessage={(msg: string) => {
												handleLlmCall(addMessage("user", msg))
											}}
											isStreaming={currentState === "GENERATING"}
											messages={messages}
										/>
									</motion.div>
								</div>
							</>

						)}
					</AnimatePresence>
					<div className="absolute flex w-full justify-center align-middle bottom-16">
						<Button variant="secondary" size="sm" className="cursor-pointer" onClick={close}>
							<LogOut className="size-4" />
							Exit Creator
						</Button>
					</div>

				</div>

			</div>
		</div>
	)
}