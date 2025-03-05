import * as React from "react"
import { cn } from "../../lib/utils"
import {
    defaultBorderRadius,
    lightGray,
    vscBadgeBackground,
    vscForeground,
    vscInputBackground,
    vscInputBorder,
    vscSidebarBorder,
    vscBackground,
    vscEditorBackground,
    vscInputBorderFocus,
} from "..";
interface TailProps extends React.HTMLAttributes<SVGElement> {
    className?: string
}

const Tail = React.forwardRef<SVGSVGElement, TailProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="absolute z-5 bottom-[-7px] right-[-4px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10.5 13.7039C6.80663 11.782 7.15173 11.3646 1.74219 11.8676L11.8696 1.70312C11.166 6.11013 12.1259 7.5877 14 9C16.2799 10.7182 16.0686 12.1951 15.2132 13.4846C14.3363 14.8066 12.5221 14.7561 10.5 13.7039Z"
                        fill={vscEditorBackground} 
                        // fill="#FFFFFF"
                        />
                </svg>
            </div>

        )
    }
)

Tail.displayName = "Tail"

export { Tail }
