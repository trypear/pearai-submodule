import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border-none whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a1a1aa] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#18181b] text-[#fafafa] shadow hover:bg-[#27272a]",
        destructive: "bg-[#ef4444] text-[#fafafa] shadow-sm hover:bg-[#dc2626]",
        outline: "border border-[#e4e4e7] bg-[#ffffff] shadow-sm hover:bg-[#f4f4f5] hover:text-[#18181b]",
        secondary: "bg-[#f4f4f5] text-[#18181b] hover:bg-[#e4e4e7]",
        ghost: "hover:bg-[#f4f4f5] hover:text-[#18181b]",
        link: "text-[#18181b] underline-offset-4 hover:underline",
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
        className: " bg-[#3030ad] text-[#0B84FF] hover:bg-[#3a3ad2]"// bg-[#27272a] text-[#fafafa]
      },
      {
        variant: "destructive",
        toggled: true,
        className: "bg-[#dc2626] text-[#fafafa]"
      },
      {
        variant: "outline",
        toggled: true,
        className: "bg-[#f4f4f5] text-[#18181b] border-[#a1a1aa]"
      },
      {
        variant: "secondary",
        toggled: true,
        // className: "bg-[#e4e4e7] text-[#18181b]"
        className: "bg-[#E3EFFF] text-[#4388F8] hover:bg-[#D1E3FF]",
      },
      {
        variant: "ghost",
        toggled: true,
        className: "bg-[#f4f4f5] text-[#18181b]"
      },
      {
        variant: "link",
        toggled: true,
        className: "text-[#18181b] underline"
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