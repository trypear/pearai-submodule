import { Button } from "./../ui/button"
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline"
import { EnterIcon } from "@radix-ui/react-icons"
import { FileText, Pencil, Sun } from "lucide-react"
import React, { useCallback, useState } from "react"
import { PearIcon } from "../ui/pearIcon"

interface InputBoxProps {
	textareaRef: React.RefObject<HTMLTextAreaElement>
	initialMessage: string
	setInitialMessage: (value: string) => void
	handleRequest: () => void
	isDisabled: boolean
}

export const InputBox: React.FC<InputBoxProps> = ({
	textareaRef,
	initialMessage,
	setInitialMessage,
	handleRequest,
	isDisabled,
}) => {
	const [makeAPlan, setMakeAPlan] = useState(false);

	const handleTextareaChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setInitialMessage(e.target.value)

			const textarea = e.target
			textarea.style.height = "36px"
			const scrollHeight = textarea.scrollHeight
			textarea.style.height = Math.min(scrollHeight, 100) + "px"
		},
		[setInitialMessage],
	)

	const handleTextareaKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey && initialMessage.trim()) {
				e.preventDefault()
				handleRequest()
			}
		},
		[handleRequest, initialMessage],
	)

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center rounded-md bg-white flex-col px-2">
				<div className="flex-1 w-full">
					<textarea
						ref={textareaRef}
						value={initialMessage}
						onChange={handleTextareaChange}
						onKeyDown={handleTextareaKeyDown}
						placeholder="What would you like to do?"
						className="w-full appearance-none bg-transparent text-gray-700 outline-none focus:outline-none resize-none overflow-y-auto rounded-lg max-h-24 leading-normal py-2 px-2 flex items-center border-none"
						autoFocus={true}
						tabIndex={1}
						rows={1}
						disabled={isDisabled}
					/>
				</div>
				<div className="flex justify-between space-x-2 p-2 w-full">
					<div className="flex flex-1 gap-2">
						<Button
							variant="secondary"
							size="sm"
							toggled={makeAPlan}
							onToggle={(newToggled) => setMakeAPlan(newToggled)}
						>
							<FileText />
							Make a plan
						</Button>
						<Button variant="secondary" size="sm">
							<Pencil className="size-4" />
							~/pearai/yeet
						</Button>
					</div>
					<Button onClick={handleRequest} disabled={!initialMessage.trim() || isDisabled} tabIndex={3}>
						<ArrowTurnDownLeftIcon className="size-4" />
						Start
					</Button>
				</div>
				{/* <div className="bg-black/10 w-full h-px" />
			<div>
				TODO: decide where the path should go
			</div> */}
			</div>
		</div>
	)
}
