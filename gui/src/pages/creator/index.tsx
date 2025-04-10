import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEvent } from "react-use"
import { RGBWrapper } from "./rgbBackground"
import { PlanEditor } from "./planEditor"
import { InputBox } from "./inputBox"
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext"

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
 *
 * - This automatically captures keystrokes and redirects them to the input
 * - Global keyboard handling: Captures keyboard input even when the textarea isn't focused
 * - Automatic text area resizing
 * - Escape key closes the overlay
 * - Enter submits the request
 * - Clicking the background closes the overlay
 */
export const CreatorOverlay = () => {
	const [initialMessage, setInitialMessage] = useState("")
	const [newProjectPlan, setNewProjectPlan] = useState("")
	const [currentState, setCurrentState] = useState<"IDEATION" | "GENERATING_PLAN" | "GENERATED_PLAN">("IDEATION")
	const [animateDirection, setAnimateDirection] = useState<"down" | "up" | null>(null);
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
			console.dir(`MSG IN LISTENER: ${JSON.stringify(msg)}`);
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

	// Register the overlayAnimation listener
	useEffect(() => {
		registerListener("overlayAnimation", (msg) => {
			console.dir(`INCOMING DIRECTION!: ${msg.data.direction}`)

			if (!msg.data?.direction) {
				console.error("overlayAnimation message did not contain direction");
				return;
			} else if (msg.data.direction !== "up" && msg.data.direction !== "down") {
				console.error("overlayAnimation message formatted wrong");
				return;
			}

			const { direction } = msg.data;
			setAnimateDirection(direction);
			console.dir(`SETTING ANIMATE DIRECTION TO: ${direction}`)
		});
	}, [registerListener]);

	useEffect(() => {
		// sending the loaded message so we can trigger all of the animations in sync
		sendMessage("loaded");
	}, []);

	// Determine the transform class based on animation direction
	const getTransformClass = useMemo(() => {
		if (animateDirection === "down") {
			return "translate-y-0";
		} else if (animateDirection === "up") {
			return "-translate-y-full";
		} else {
			return "-translate-y-full"; // Default to hidden
		}
	}, [animateDirection]);

	return (
		<div className="w-full h-full">
			<div 
				onClick={close} 
				className={`all-initial fixed inset-0 flex items-center justify-center bg-transparent font[var(--vscode-font-family)] transition-transform duration-500 ease-out ${getTransformClass}`}
			>
				<div 
					onClick={(e) => e.stopPropagation()} 
					className="justify-center align-middle m-auto w-full max-w-3xl"
				>
					<RGBWrapper className="px-4 my-auto w-full">
						{/* Stage 1: get the input from the user about what to make */}
						<InputBox
							textareaRef={textareaRef}
							initialMessage={initialMessage}
							setInitialMessage={setInitialMessage}
							handleRequest={handleRequest}
							isDisabled={currentState !== "IDEATION"}
						/>
						{/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}
						{(currentState === "GENERATING_PLAN" || currentState === "GENERATED_PLAN") && (
							<>
								<div className="my-6 border-t border-gray-200"></div>

								<PlanEditor
									initialMessage={initialMessage}
									newProjectPlan={newProjectPlan}
									setNewProjectPlan={setNewProjectPlan}
									isStreaming={currentState === "GENERATING_PLAN"}
									planCreationDone={currentState === "GENERATED_PLAN"}
									handleMakeIt={handleMakeIt}
								/>
							</>
						)}
					</RGBWrapper>
				</div>
			</div>
		</div>
	)
}