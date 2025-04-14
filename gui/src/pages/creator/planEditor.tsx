import React, { useEffect, useRef, useState } from "react"
import { PlanningBar } from "./ui/planningBar"
import { InputBox } from "./inputBox"
import StyledMarkdownPreview from "../../components/markdown/StyledMarkdownPreview"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"


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
	const [message, setMessage] = useState<string>("");

	// Auto-scroll to bottom when content changes
	useEffect(() => {
		if (planContainerRef.current && newProjectPlan) {
			planContainerRef.current.scrollTop = planContainerRef.current.scrollHeight;
		}
	}, [newProjectPlan]);

	return (
		<div className="flex-1 flex flex-col min-h-0 mt-4">
			<div className="flex flex-col gap-4 min-h-0 flex-1">
				<PlanningBar isGenerating={isStreaming} requestedPlan={initialMessage} playCallback={handleMakeIt} nextCallback={handleMakeIt} />
				<div
					className="rounded-lg p-4 overflow-auto flex-1 relative"
					style={{
						scrollBehavior: 'smooth'
					}}
					ref={planContainerRef}
				>
					<div className="absolute inset-0 overflow-y-auto px-4">
						{newProjectPlan ? (
							<StyledMarkdownPreview
								source={newProjectPlan}
								showCodeBorder={true}
								isStreaming={isStreaming}
								isLast={true}
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
						) : (
							<div className="text-[var(--widgetForeground)]">
								Project plan is generating...
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="bg-[var(--widgetBackground)] rounded-lg p-4 mt-4">
				<InputBox
					textareaRef={editMessageTextAreaRef}
					handleRequest={() => { }}
					setInitialMessage={(m) => setMessage(m)}
					initialMessage={message}
					isDisabled={isStreaming}
					placeholder="Propose a change"
					initialRows={8}
					submitButton={{
						id: "submit",
						label: "Start",
						icon: <ArrowTurnDownLeftIcon className="size-4" />,
						variant: "default" as const,
						size: "default" as const,
					  }}

				/>
				{/* {planCreationDone && (
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
				)} */}
			</div>
		</div>
	)
}
