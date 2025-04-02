import { Wand2 } from "lucide-react"
import React, { useCallback, useEffect, useRef } from "react"
import { PlanningBar } from "./ui/planningBar"

interface PlanEditorProps {
	newProjectPlan: string
	setNewProjectPlan: (value: string) => void
	isStreaming: boolean
	planCreationDone: boolean
	handleMakeIt: () => void
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
	newProjectPlan,
	setNewProjectPlan,
	isStreaming,
	planCreationDone,
	handleMakeIt,
}) => {
	const planTextareaRef = useRef<HTMLTextAreaElement | null>(null)

	const handlePlanTextareaChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setNewProjectPlan(e.target.value)

			const textarea = e.target
			textarea.style.height = "100px"
			const scrollHeight = textarea.scrollHeight
			textarea.style.height = Math.min(scrollHeight, 300) + "px"
		},
		[setNewProjectPlan],
	)

	// Auto-resize the plan textarea when content changes
	useEffect(() => {
		if (planTextareaRef.current && newProjectPlan) {
			const textarea = planTextareaRef.current
			textarea.style.height = "100px"
			const scrollHeight = textarea.scrollHeight
			textarea.style.height = Math.min(scrollHeight, 300) + "px"
		}
	}, [newProjectPlan])

	// Focus the textarea when plan creation is complete
	useEffect(() => {
		if (planCreationDone && !isStreaming && planTextareaRef.current) {
			setTimeout(() => {
				planTextareaRef.current?.focus()
			}, 100)
		}
	}, [planCreationDone, isStreaming])

	return (
		<div className="rounded-lg bg-white p-4">
			<PlanningBar />
			<textarea
				ref={planTextareaRef}
				value={newProjectPlan}
				onChange={handlePlanTextareaChange}
				placeholder="Project plan is generating..."
				className="w-full appearance-none bg-transparent text-gray-700 outline-none focus:outline-none resize-none overflow-y-auto rounded-lg min-h-24 leading-normal py-2 px-2 flex items-center border border-gray-200"
				disabled={isStreaming}
				tabIndex={4}
				rows={5}
			/>

			{planCreationDone && (
				<div className="mt-4 flex justify-end">
					<button
						onClick={handleMakeIt}
						disabled={!newProjectPlan.trim()}
						className="flex cursor-pointer gap-2 rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colours duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
						tabIndex={5}>
						<Wand2 className="h-4 w-4" />
						<div className="flex-1">Make it</div>
					</button>
				</div>
			)}
		</div>
	)
}
