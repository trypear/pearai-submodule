import { Wand2 } from "lucide-react"
import React, { useCallback, useEffect, useRef } from "react"
import { PlanningBar } from "./ui/planningBar"
import { InputBox } from "./inputBox"

interface PlanEditorProps {
	newProjectPlan: string
	setNewProjectPlan: (value: string) => void
	initialMessage: string;
	isStreaming: boolean
	planCreationDone: boolean
	handleMakeIt: () => void
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
	newProjectPlan,
	setNewProjectPlan,
	isStreaming,
	planCreationDone,
	initialMessage,
	handleMakeIt,
}) => {
	const planContainerRef = useRef<HTMLDivElement>(null);
	const editMessageTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

	// Auto-scroll to bottom when content changes
	useEffect(() => {
		if (planContainerRef.current && newProjectPlan) {
			planContainerRef.current.scrollTop = planContainerRef.current.scrollHeight;
		}
	}, [newProjectPlan]);

	return (
		<div className="flex-1 flex flex-col justify-between">
			<div className="flex flex-col gap-4">
				<PlanningBar isGenerating={isStreaming} requestedPlan={initialMessage} />
				<div
					className="rounded-lg p-4 bg-[var(--widgetBackground)] max-h-[300px] overflow-y-auto"
					style={{
						scrollBehavior: 'smooth'
					}}
					ref={planContainerRef}
				>
					<div
						className="whitespace-pre-wrap text-[var(--widgetForeground)] leading-normal py-2 px-2"
					>
						{newProjectPlan || "Project plan is generating..."}
					</div>
				</div>
			</div>
			<div className="bg-[var(--widgetBackground)] rounded-lg p-4">
				<InputBox
					textareaRef={editMessageTextAreaRef}
					handleRequest={() => { }}
					initialMessage=""
					isDisabled={isStreaming}
					setInitialMessage={() => { }}
					placeholder="Enter your message..."
				/>
				{planCreationDone && (
					<div className="mt-4 flex justify-end">
						<button
							onClick={handleMakeIt}
							disabled={!newProjectPlan.trim()}
							className="flex cursor-pointer gap-2 rounded-md bg-[var(--buttonBackground)] px-6 py-2 text-sm font-medium text-[var(--buttonForeground)] transition-colors duration-200 hover:bg-[var(--buttonHoverBackground)] disabled:opacity-50 disabled:cursor-not-allowed"
							tabIndex={5}>
							<Wand2 className="h-4 w-4" />
							<div className="flex-1">Make it</div>
						</button>
					</div>
				)}
			</div>
		</div>

	)
}
