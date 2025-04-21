import { cn } from "@/lib/utils"
import React, { FC, ReactNode } from "react"

/**
 * A simple RGB gradient background wrapper
 */
export const RGBWrapper: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
	return (
		<div className={cn(className, "relative")}>
			{/* RGB Gradient Background */}
			<div className="absolute -top-1 -right-1 -bottom-1 -left-1 -z-10 overflow-hidden rounded-3xl blur-[12px] opacity-50">
				<div className="h-full w-full [background-image:linear-gradient(to_bottom_right,_#5DED83_0%,_#0CBBAF_33%,_#764CEA_66%,_#EA50A2_100%)]"></div>
			</div>

			{/* Content - removed shadow-lg and p-2 */}
			{children}
		</div>
	)
}
