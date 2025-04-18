import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex hover:cursor-pointer items-center justify-center border-none whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent",
  {
    variants: {
      variant: {
        default: "bg-button text-button-foreground shadow hover:bg-button/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:opacity-80 text-foreground",
        secondary:
          "bg-input text-input-foreground shadow-sm hover:bg-input/80",
        ghost: "hover:bg-input text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        animated: "bg-input text-foreground transition-all duration-200 text-[0.9rem] hover:-translate-y-[1px]",
      },
      size: {
        default: "h-9 rounded-lg px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
