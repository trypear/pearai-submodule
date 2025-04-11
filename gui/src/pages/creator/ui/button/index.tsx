import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border-none whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a1a1aa] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--buttonBackground)] text-[var(--buttonForeground)] shadow hover:bg-[var(--buttonHoverBackground)]",
        destructive: "bg-[#ef4444] text-[var(--buttonForeground)] shadow-sm hover:bg-[#dc2626]",
        outline: "border border-[#e4e4e7] bg-[#ffffff] shadow-sm hover:bg-[var(--buttonHoverBackground)] hover:text-[var(--buttonForeground)]",
        secondary: "bg-[var(--widgetBackground)] text-[var(--widgetForeground)] hover:bg-[var(--buttonHoverBackground)]",
        ghost: "hover:bg-[var(--buttonHoverBackground)] hover:text-[var(--buttonForeground)]",
        link: "text-[var(--buttonForeground)] underline-offset-4 hover:underline",
      },
      size: {
        // default: "h-9 px-4 py-2",
        default: "h-7 rounded-md px-2 text-md",
        sm: "h-6 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      toggled: {
        true: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        toggled: true,
        className: "bg-[var(--buttonBackground)] text-[var(--buttonForeground)] hover:bg-[var(--buttonHoverBackground)]"
      },
      {
        variant: "destructive",
        toggled: true,
        className: "bg-[#dc2626] text-[var(--buttonForeground)]"
      },
      {
        variant: "outline",
        toggled: true,
        className: "bg-[var(--widgetBackground)] text-[var(--widgetForeground)] border-[#a1a1aa]"
      },
      {
        variant: "secondary",
        toggled: true,
        className: "bg-[var(--widgetBackground)] text-[var(--widgetForeground)] hover:bg-[var(--buttonHoverBackground)]",
      },
      {
        variant: "ghost",
        toggled: true,
        className: "bg-[var(--widgetBackground)] text-[var(--widgetForeground)]"
      },
      {
        variant: "link",
        toggled: true,
        className: "text-[var(--buttonForeground)] underline"
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      toggled: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  onToggle?: (toggled: boolean) => void
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    toggled: initialToggled = false,
    asChild = false, 
    onToggle,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [toggled, setToggled] = React.useState(initialToggled)
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onToggle) {
        const newToggled = !toggled
        setToggled(newToggled)
        onToggle(newToggled)
      }
      
      onClick?.(event)
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant,
            size,
            toggled: onToggle ? toggled : initialToggled,
            className 
          })
        )}
        ref={ref}
        onClick={onToggle ? handleClick : onClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }