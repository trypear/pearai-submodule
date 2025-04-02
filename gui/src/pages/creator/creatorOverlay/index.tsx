import { vscode } from "@/lib/vscode"
import { useCallback, useEffect, useRef, useState } from "react"
import { useEvent } from "react-use"
import { RGBWrapper } from "./rgbBackground"
import { PlanEditor } from "./planEditor"
import { InputBox } from "./inputBox"

type ExtensionMessage = 
  | { type: "planCreationStream"; text: string }
  | { type: "planCreationSuccess" }
  | { type: "pearAiCloseCreatorInterface" }
  | { type: "pearAiHideCreatorLoadingOverlay" }
  | { type: "newCreatorModeTask"; text: string }
  | { type: "creatorModePlannedTaskSubmit"; text: string };

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

	const close = useCallback(() => {
		setInitialMessage("")
		setNewProjectPlan("")
		setPlanCreationDone(false)
		setIsStreaming(false)
		vscode.postMessage({
			type: "pearAiCloseCreatorInterface",
		})
		setInitialMessage("")
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
		vscode.postMessage({
			type: "pearAiHideCreatorLoadingOverlay",
		})

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

	const handleRequest = useCallback(() => {
		if (initialMessage.trim()) {
			setIsStreaming(true)
			vscode.postMessage({
				type: "newCreatorModeTask",
				text: initialMessage,
			})
		}
	}, [initialMessage])

	const handleMakeIt = useCallback(() => {
		if (newProjectPlan.trim()) {
			vscode.postMessage({
				type: "creatorModePlannedTaskSubmit",
				text: `INITIAL IDEA: ${initialMessage} -- PLAN: ${newProjectPlan}`,
			})
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
		<div onClick={close} className="fixed inset-0 flex items-center justify-center bg-white">
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
