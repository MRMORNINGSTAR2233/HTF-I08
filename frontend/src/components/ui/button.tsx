import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "primary" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variantClasses = {
      default: "bg-dark-700 hover:bg-dark-600 text-white",
      outline: "border border-white/10 bg-transparent hover:bg-dark-700 text-white",
      ghost: "bg-transparent hover:bg-dark-700 text-white",
      primary: "bg-primary-600 hover:bg-primary-700 text-white purple-glow",
      secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20"
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10"
    }
    
    const buttonClass = `inline-flex items-center justify-center rounded-md font-medium transition-colors 
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                        focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    
    return (
      <Comp className={buttonClass} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button } 