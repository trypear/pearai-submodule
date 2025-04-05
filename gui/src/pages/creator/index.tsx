import { useCallback, useEffect, useRef, useState } from "react"
import { useEvent } from "react-use"
import { RGBWrapper } from "./rgbBackground"
import { PlanEditor } from "./planEditor"
import { InputBox } from "./inputBox"
import "./ui/index.css";
import { useMessaging } from "@/util/messagingContext"

type ExtensionMessage = 
  | { type: "planCreationStream"; text: string }
  | { type: "planCreationSuccess" }
  | { type: "pearAiCloseCreatorInterface" }
  | { type: "pearAiHideCreatorLoadingOverlay" }
  | { type: "newCreatorModeTask"; text: string }
  | { type: "creatorModePlannedTaskSubmit"; text: string };

// TODO: SORT OUT FONTS HERE!

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
	const [planCreationDone, setPlanCreationDone] = useState(false)
	const [isStreaming, setIsStreaming] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const isCapturingRef = useRef(false)
	const { sendMessage, registerListener, unregisterListener } = useMessaging();


	const close = useCallback(() => {
		setInitialMessage("")
		setNewProjectPlan("")
		setPlanCreationDone(false)
		setIsStreaming(false)
		setInitialMessage("")
		sendMessage("Close");
	}, [])

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
		const newProjectListener = registerListener("PlanStream", (msg) => {
			setNewProjectPlan(msg.payload.plan);
		});

		// TODO: unregister on success
	}, [registerListener]);

	const handleRequest = useCallback(async () => {
		if (initialMessage.trim()) {
			await sendMessage("NewIdea", {
				text: `INITIAL IDEA: ${initialMessage} -- PLAN: ${newProjectPlan}`,
				plan: true,
			}, true);
			setIsStreaming(true);
		}
	}, [initialMessage, close])

	const handleMakeIt = useCallback(async () => {
		if (newProjectPlan.trim()) {
			await sendMessage("NewIdeaPlanned", {
				text: `INITIAL IDEA: ${initialMessage} -- PLAN: ${newProjectPlan}`
			}, true);
			close()
		}
	}, [newProjectPlan, close])

	const onMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data

		if (message.type === "planCreationStream" && message.text) {
			console.log(`STREAMED TEXT: ${message.text}`)
			setNewProjectPlan(message.text)
		} else if (message.type === "planCreationSuccess") {
			setIsStreaming(false)
			setPlanCreationDone(true)
		}
	}, [])

	useEvent("message", onMessage)

	return (
		<div onClick={close} className="all-initial fixed inset-0 flex items-center justify-center bg-white font[var(--vscode-font-family)]">
			<div onClick={(e) => e.stopPropagation()} className="justify-center align-middle m-auto w-full max-w-3xl ">
				<RGBWrapper className="px-4 my-auto w-full">
					{/* Stage 1: get the input from the user about what to make */}
					{
						(!isStreaming && !planCreationDone) && (
							<InputBox
								textareaRef={textareaRef}
								initialMessage={initialMessage}
								setInitialMessage={setInitialMessage}
								handleRequest={handleRequest}
								isDisabled={isStreaming || planCreationDone}
							/>
						)
					}
					{/* Stage 2: Stream down the plan and display it to the user, let them comment and formulate the plan */}
					{(isStreaming || planCreationDone) && (
						<>
							<div className="my-6 border-t border-gray-200"></div>

							<PlanEditor
								initialMessage={initialMessage}
								newProjectPlan={newProjectPlan}
								setNewProjectPlan={setNewProjectPlan}
								isStreaming={isStreaming}
								planCreationDone={planCreationDone}
								handleMakeIt={handleMakeIt}
							/>
						</>
					)}
				</RGBWrapper>
			</div>
		</div>
	)
}
