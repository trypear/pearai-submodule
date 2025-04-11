import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEvent } from "react-use"
import { RGBWrapper } from "./rgbBackground"
import { PlanEditor } from "./planEditor"
import { InputBox } from "./inputBox"
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext"
import { PearIcon } from "./ui/pearIcon"
import { Button } from "./ui/button"
import { FileText, LogOut, Pencil } from "lucide-react"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"



// TODO: refactor - works for now and I'm too scared to touch it - James
// Animation info stored in window to survive component remounts
if (typeof window !== 'undefined') {
	window.__creatorOverlayAnimation = window.__creatorOverlayAnimation || {
		direction: null,
		timestamp: 0
	};
}

const getAnimationDirection = () => {
	if (typeof window === 'undefined') return null;
	// If it's been more than 1 second since the last animation update,
	// assume we're in a stable state based on the last known direction
	const now = Date.now();
	const timeSinceUpdate = now - window.__creatorOverlayAnimation.timestamp;

	if (timeSinceUpdate > 1000) {
		// If last direction was "up", we should be hidden (-100%)
		// If last direction was "down", we should be visible (0)
		// If no direction yet, default null
		return window.__creatorOverlayAnimation.direction;
	}

	// We're in an active animation, return the current direction
	return window.__creatorOverlayAnimation.direction;
};

const setAnimationDirection = (direction) => {
	if (typeof window === 'undefined') return;
	window.__creatorOverlayAnimation = {
		direction,
		timestamp: Date.now()
	};
};

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

	const [initialMessage, setInitialMessage] = useState("")
	const [newProjectPlan, setNewProjectPlan] = useState("")
	const [currentState, setCurrentState] = useState<"IDEATION" | "GENERATING_PLAN" | "GENERATED_PLAN">("IDEATION")

	// Keep animation state in a ref to prevent render cycles
	const animationRef = useRef(getAnimationDirection());

	// Force a rerender when animation changes 
	const [, forceUpdate] = useState({});

	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const isCapturingRef = useRef(false)
	const { sendMessage, typedRegister, registerListener } = useMessaging();

	const close = useCallback(() => {
		setInitialMessage("")
		setNewProjectPlan("")
		setCurrentState("IDEATION")
		sendMessage("Close");
	}, [sendMessage])

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
			if (e.key === "Escape") {
				close()
				return
			}

			if (document.activeElement === textareaRef.current) {
				return
			}

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

		window.addEventListener("keydown", handleKeyDown, { capture: true })

		return () => {
			window.removeEventListener("keydown", handleKeyDown, { capture: true })
		}
	}, [close, forceFocus])

	useEffect(() => {
		typedRegister("planCreationStream", (msg) => {
			setNewProjectPlan(msg.data.plan);
			setCurrentState("GENERATING_PLAN");
		});
		typedRegister("planCreationCompleted", (msg) => {
			setNewProjectPlan(msg.data.plan);
			setCurrentState("GENERATED_PLAN");
		})
	}, [typedRegister]);

	const handleRequest = useCallback(async () => {
		if (initialMessage.trim()) {
			await sendMessage("NewIdea", {
				text: `INITIAL IDEA: ${initialMessage} -- PLAN: ${newProjectPlan}`,
				plan: true,
			}, true);
			setCurrentState("GENERATING_PLAN");
		}
	}, [initialMessage, newProjectPlan, sendMessage])

	const handleMakeIt = useCallback(async () => {
		if (newProjectPlan.trim()) {
			await sendMessage("SubmitPlan", {
				plan: `INITIAL IDEA: ${initialMessage} -- PLAN: ${newProjectPlan}`
			}, true);
			close()
		}
	}, [initialMessage, newProjectPlan, close, sendMessage])

	// Animation handler - directly manipulates the DOM element to ensure
	// animation works even if component remounts
	useEffect(() => {
		const handleAnimation = (msg) => {
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

	// Get current animation state from window/ref
	const currentDirection = useMemo(() => {
		const direction = getAnimationDirection();
		return direction;
	}, [/* deliberately empty to run only on mount */]);

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
			<div
				onClick={close}
				style={getTransformStyle()}
				className="all-initial fixed inset-0 flex items-center justify-center bg-transparent font[var(--vscode-font-family)] animate flex-col"
			>
				<div
					onClick={(e) => e.stopPropagation()}
					className="justify-center align-middle m-auto w-full max-w-2xl flex flex-col h-full"
				>

					<div className="flex gap-4 flex-col">
						<div className={`flex justify-center align-middle text-black w-full gap-2 text-lg ${currentState === "IDEATION" ? "opacity-100" : "opacity-0"} animate transition-opacity delay-`}>
							<PearIcon className="my-auto size-8" />
							<div className="my-auto">
								What would you like to make?
							</div>
						</div>
						{ /* TODO: WE WILL WANT TO ANIMATE THIS INTO THE PLANNING BAR IDEALLY */
							currentState === "IDEATION" && (
								<RGBWrapper className="px-4 my-auto w-full">
									{/* Stage 1: get the input from the user about what to make */}
									<InputBox
										textareaRef={textareaRef}
										initialMessage={initialMessage}
										setInitialMessage={setInitialMessage}
										handleRequest={handleRequest}
										isDisabled={currentState !== "IDEATION"}
										leftButtons={[
											{
												id: "make-plan",
												icon: <FileText />,
												label: "Make a plan",
												togglable: true,
												variant: "secondary",
												size: "sm",
												onToggle: (toggled) => console.log("Plan toggled:", toggled),
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
							)
						}

					</div>

					{/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}
					{(currentState === "GENERATING_PLAN" || currentState === "GENERATED_PLAN") && (
						<PlanEditor
							initialMessage={initialMessage}
							newProjectPlan={newProjectPlan}
							setNewProjectPlan={setNewProjectPlan}
							isStreaming={currentState === "GENERATING_PLAN"}
							planCreationDone={currentState === "GENERATED_PLAN"}
							handleMakeIt={handleMakeIt}
						/>
					)}
				</div>
				<div >
				</div>
				<Button variant="secondary" size="sm" className="mb-8 cursor-pointer mt-4">
					<LogOut className="size-4" />
					Exit Creator
				</Button>
			</div>
		</div>
	)
}