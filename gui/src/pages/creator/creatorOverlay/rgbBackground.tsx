import { cn } from "@/lib/utils"
import React, { FC, ReactNode } from "react"

/**
 * A simple RGB gradient background wrapper
 */
export const RGBWrapper: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
	return (
		<div className={cn(className, "relative")}>
			{/* RGB Gradient Background */}
			<div className="absolute -top-10 -right-10 -bottom-10 -left-10 -z-10 grid grid-cols-2 overflow-hidden rounded-3xl blur-xl opacity-50">
				<div className="bg-gradient-to-br from-pink-500 to-blue-600"></div>
				<div className="bg-gradient-to-tr from-blue-600 to-cyan-400"></div>
			</div>

			{/* Content - removed shadow-lg and p-2 */}
			{children}
		</div>
	)
}
