import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight } from "lucide-react"

const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}>({
  collapsed: false,
  setCollapsed: () => {},
})

export const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "h-full overflow-y-auto bg-[#121212] border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  forcedCollapsed?: boolean
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, forcedCollapsed, ...props }, ref) => {
    const { collapsed } = useSidebar()
    const isCollapsed = forcedCollapsed !== undefined ? forcedCollapsed : collapsed

    return (
      <aside
        ref={ref}
        className={cn(sidebarVariants({ collapsed: isCollapsed }), className)}
        data-collapsed={isCollapsed}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-2", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto px-3", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-2 mt-auto", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar()
  
  if (collapsed) {
    return null
  }
  
  return (
    <div
      ref={ref}
      className={cn("text-xs font-medium text-zinc-400 mb-2", className)}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  active?: boolean
  tooltip?: string
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, active, tooltip, children, ...props }, ref) => {
  const { collapsed } = useSidebar()
  
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "w-full justify-start h-10 px-2",
        "flex items-center rounded-md text-sm",
        "text-zinc-300 hover:text-white hover:bg-zinc-800",
        active && "bg-zinc-800 text-white",
        className
      )}
      title={collapsed ? tooltip : undefined}
      {...props}
    >
      {children}
    </Button>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarTrigger = ({ className }: { className?: string }) => {
  const { collapsed, setCollapsed } = useSidebar()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 rounded-md", className)}
      onClick={() => setCollapsed(!collapsed)}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span className="sr-only">
        {collapsed ? "Expand sidebar" : "Collapse sidebar"}
      </span>
    </Button>
  )
}

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarInset.displayName = "SidebarInset"

export const SidebarRail = () => {
  const { collapsed, setCollapsed } = useSidebar()
  
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-1">
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-5 cursor-pointer items-center justify-center rounded-full border border-zinc-800 bg-[#121212]"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-zinc-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-zinc-400" />
        )}
      </div>
    </div>
  )
} 