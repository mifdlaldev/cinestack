"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

// ─── Contexts ──────────────────────────────────────────

interface DropdownMenuContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  triggerElRef: React.MutableRefObject<HTMLElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error("DropdownMenu components must be used within <DropdownMenu>")
  return ctx
}

interface SubmenuContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLDivElement | null>
}

const SubmenuContext = React.createContext<SubmenuContextValue | null>(null)

function useSubmenuContext() {
  const ctx = React.useContext(SubmenuContext)
  if (!ctx) throw new Error("DropdownMenuSub must be within <DropdownMenuSub>")
  return ctx
}

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

// ─── Root ──────────────────────────────────────────────

interface DropdownMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function DropdownMenu({ open: controlledOpen, defaultOpen, onOpenChange, children }: DropdownMenuProps) {
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const triggerElRef = React.useRef<HTMLElement | null>(null)

  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen, triggerRef, triggerElRef }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

// ─── Portal ────────────────────────────────────────────

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

// ─── Trigger ───────────────────────────────────────────

function DropdownMenuTrigger({ children, render, ...props }: React.ComponentPropsWithoutRef<"button"> & {
  render?: React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent) => void }>
}) {
  const { open, onOpenChange, triggerRef, triggerElRef } = useDropdownMenuContext()

  if (render) {
    // Capture the rendered DOM element so DropdownMenuContent can use it for positioning
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      ref: (node: HTMLElement | null) => {
        triggerElRef.current = node
        // Forward ref if the wrapped component exposes one
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childRef = (render as any).ref
        if (childRef && typeof childRef === "object") childRef.current = node
      },
      "data-slot": "dropdown-menu-trigger",
      onClick: (e: React.MouseEvent) => {
        render.props.onClick?.(e)
        onOpenChange(!open)
      },
      ...props,
    }, children)
  }

  return (
    <button
      ref={triggerRef}
      data-slot="dropdown-menu-trigger"
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Content ───────────────────────────────────────────

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<"div"> {
  align?: "start" | "center" | "end"
  alignOffset?: number
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

function DropdownMenuContent({
  className,
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  const { open, onOpenChange, triggerRef, triggerElRef } = useDropdownMenuContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [positioned, setPositioned] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  const recalcPosition = React.useCallback(() => {
    const triggerEl = triggerRef.current ?? triggerElRef.current
    if (!triggerEl || !contentRef.current) return
    const triggerRect = triggerEl.getBoundingClientRect()
    const content = contentRef.current
    const pos = { top: 0, left: 0 }

    switch (side) {
      case "bottom": pos.top = triggerRect.bottom + sideOffset; break
      case "top": pos.top = triggerRect.top - content.offsetHeight - sideOffset; break
      case "left": pos.left = triggerRect.left - content.offsetWidth - sideOffset; break
      case "right": pos.left = triggerRect.right + sideOffset; break
    }
    switch (align) {
      case "start":
        if (side === "bottom" || side === "top") pos.left = triggerRect.left + alignOffset
        else pos.top = triggerRect.top + alignOffset
        break
      case "center":
        if (side === "bottom" || side === "top") pos.left = triggerRect.left + triggerRect.width / 2 - content.offsetWidth / 2 + alignOffset
        else pos.top = triggerRect.top + triggerRect.height / 2 - content.offsetHeight / 2 + alignOffset
        break
      case "end":
        if (side === "bottom" || side === "top") pos.left = triggerRect.right - content.offsetWidth - alignOffset
        else pos.top = triggerRect.bottom - content.offsetHeight - alignOffset
        break
    }
    setPosition(pos)
  }, [side, sideOffset, align, alignOffset, triggerRef])

  React.useEffect(() => {
    if (!open || !mounted) return
    recalcPosition()
    // Recalc on next frame for settled layout, then make visible
    const raf = requestAnimationFrame(() => {
      recalcPosition()
      requestAnimationFrame(() => setPositioned(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [open, mounted, recalcPosition])

  // Close on scroll outside content — allows scrolling inside dropdown
  React.useEffect(() => {
    if (!open) return
    const closeOnScroll = (e: Event) => {
      if (contentRef.current?.contains(e.target as Node)) return
      onOpenChange(false)
    }
    window.addEventListener("scroll", closeOnScroll, true)
    return () => window.removeEventListener("scroll", closeOnScroll, true)
  }, [open, onOpenChange])

  // Click outside handler
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
    const triggerEl = triggerRef.current ?? triggerElRef.current
      if (triggerEl?.contains(target)) return
      if (contentRef.current?.contains(target)) return
      onOpenChange(false)
    }
    const id = setTimeout(() => document.addEventListener("pointerdown", handler), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener("pointerdown", handler)
    }
  }, [open, triggerRef, onOpenChange])

  // ESC key handler
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      data-side={side}
      data-open=""
      className={cn(
        "fixed z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl p-1 shadow-lg outline-none bg-black/70 backdrop-blur-[20px] border border-white/[0.06]",
        !positioned && "opacity-0 pointer-events-none",
        className,
      )}
      style={positioned ? { top: position.top, left: position.left } : undefined}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

// ─── Group ──────────────────────────────────────────────

function DropdownMenuGroup({ children, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="dropdown-menu-group" {...props}>
      {children}
    </div>
  )
}

// ─── Label ─────────────────────────────────────────────

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentPropsWithoutRef<"div"> & { inset?: boolean }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className)}
      {...props}
    />
  )
}

// ─── Item ──────────────────────────────────────────────

interface DropdownMenuItemProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  inset?: boolean
  variant?: "default" | "destructive"
  render?: React.ReactElement<{ className?: string }>
  children?: React.ReactNode
}

function DropdownMenuItem({ className, inset, variant = "default", render, children, ...props }: DropdownMenuItemProps) {
  const { onOpenChange } = useDropdownMenuContext()

  const baseProps = {
    role: "menuitem" as const,
    tabIndex: -1,
    "data-slot": "dropdown-menu-item" as const,
    "data-inset": inset || undefined,
    "data-variant": variant,
    className: cn(
      "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden select-none text-text transition-colors duration-300 hover:text-accent focus:text-accent data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
      className,
    ),
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      props.onClick?.(e)
      onOpenChange(false)
    },
  }

  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      className: cn((render.props as Record<string, unknown>).className as string ?? "", baseProps.className),
      onClick: baseProps.onClick,
    }, children)
  }

  return <div {...baseProps} {...props}>{children}</div>
}

// ─── Sub ───────────────────────────────────────────────

function DropdownMenuSub({ children, open: controlledOpen, defaultOpen, onOpenChange }: {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  return (
    <SubmenuContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
      {children}
    </SubmenuContext.Provider>
  )
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentPropsWithoutRef<"div"> & { inset?: boolean }) {
  const { open, onOpenChange } = useSubmenuContext()

  return (
    <div
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      data-open={open ? "" : undefined}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </div>
  )
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentPropsWithoutRef<"div"> & {
  align?: string
  alignOffset?: number
  side?: string
  sideOffset?: number
}) {
  const { open, triggerRef } = useSubmenuContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const content = contentRef.current
    const pos = { top: triggerRect.top, left: triggerRect.right + 4 }
    if (pos.left + content.offsetWidth > window.innerWidth) {
      pos.left = triggerRect.left - content.offsetWidth - 4
    }
    setPosition(pos)
  }, [open, triggerRef])

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "fixed z-50 w-auto min-w-[96px] overflow-x-hidden overflow-y-auto rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg duration-100",
        className,
      )}
      style={{ top: position.top, left: position.left }}
      {...props}
    />,
    document.body,
  )
}

// ─── Checkbox Item ─────────────────────────────────────

function DropdownMenuCheckboxItem({ className, children, checked, inset, ...props }: React.ComponentPropsWithoutRef<"div"> & {
  checked?: boolean
  inset?: boolean
}) {
  const { onOpenChange } = useDropdownMenuContext()

  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(e) => {
        props.onClick?.(e as React.MouseEvent<HTMLDivElement>)
        onOpenChange(false)
      }}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-checkbox-item-indicator">
        {checked && <CheckIcon />}
      </span>
      {children}
    </div>
  )
}

// ─── Radio Group ───────────────────────────────────────

function DropdownMenuRadioGroup({ children, value, onValueChange, ...props }: React.ComponentPropsWithoutRef<"div"> & {
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div data-slot="dropdown-menu-radio-group" role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

function DropdownMenuRadioItem({ className, children, inset, value, ...props }: React.ComponentPropsWithoutRef<"div"> & {
  value?: string
  inset?: boolean
}) {
  const radioCtx = React.useContext(RadioGroupContext)
  const { onOpenChange } = useDropdownMenuContext()
  const isSelected = radioCtx?.value === value

  return (
    <div
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      role="menuitemradio"
      aria-checked={isSelected}
      tabIndex={-1}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(e) => {
        radioCtx?.onValueChange?.(value ?? "")
        props.onClick?.(e as React.MouseEvent<HTMLDivElement>)
        onOpenChange(false)
      }}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-radio-item-indicator">
        {isSelected && <CheckIcon />}
      </span>
      {children}
    </div>
  )
}

// ─── Separator ─────────────────────────────────────────

function DropdownMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

// ─── Shortcut ──────────────────────────────────────────

function DropdownMenuShortcut({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
