"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

// ─── Context ──────────────────────────────────────────

interface SelectContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  onValueChange?: (value: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  selectedLabel?: string
  setSelectedLabel: (label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within <Select>")
  return ctx
}

// ─── Root ─────────────────────────────────────────────

interface SelectProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select(
  { open: controlledOpen, defaultOpen, onOpenChange, value: controlledValue, defaultValue, onValueChange, children },
  ref,
) {
  const isControlledOpen = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const isControlledValue = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "")

  const open = isControlledOpen ? controlledOpen : uncontrolledOpen
  const value = isControlledValue ? controlledValue : uncontrolledValue

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlledOpen) setUncontrolledOpen(v)
      onOpenChange?.(v)
    },
    [isControlledOpen, onOpenChange],
  )

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlledValue) setUncontrolledValue(v)
      onValueChange?.(v)
    },
    [isControlledValue, onValueChange],
  )

  return (
    <SelectContext.Provider value={{ open, onOpenChange: setOpen, value, onValueChange: setValue, triggerRef, selectedLabel, setSelectedLabel }}>
      <div ref={ref} data-slot="select-root">{children}</div>
    </SelectContext.Provider>
  )
})

// ─── Group ─────────────────────────────────────────────

function SelectGroup({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props} />
}

// ─── Value ────────────────────────────────────────────

function SelectValue({ className, placeholder, ...props }: React.ComponentPropsWithoutRef<"span"> & { placeholder?: string }) {
  const { selectedLabel } = useSelectContext()
  return (
    <span
      data-slot="select-value"
      data-placeholder={!selectedLabel ? "" : undefined}
      className={cn("flex flex-1 text-left", !selectedLabel && "text-muted-foreground", className)}
      {...props}
    >
      {selectedLabel || placeholder || ""}
    </span>
  )
}

// ─── Trigger ──────────────────────────────────────────

function SelectTrigger({ className, size = "default", children, ...props }: React.ComponentPropsWithoutRef<"button"> & { size?: "sm" | "default" }) {
  const { open, onOpenChange, triggerRef } = useSelectContext()

  return (
    <button
      ref={triggerRef}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-full border border-border bg-transparent px-[15px] py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-7 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </button>
  )
}

// ─── Content ──────────────────────────────────────────

function SelectContent({ className, children, side = "bottom", sideOffset = 4, align = "center", alignOffset = 0, ...props }: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "bottom"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  alignItemWithTrigger?: boolean
}) {
  const { open, onOpenChange, triggerRef } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [positioned, setPositioned] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  const recalcPosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const content = contentRef.current
    let top = 0, left = 0

    if (side === "bottom") {
      top = triggerRect.bottom + sideOffset
    } else {
      top = triggerRect.top - content.offsetHeight - sideOffset
    }

    switch (align) {
      case "start": left = triggerRect.left + alignOffset; break
      case "center": left = triggerRect.left + triggerRect.width / 2 - content.offsetWidth / 2 + alignOffset; break
      case "end": left = triggerRect.right - content.offsetWidth - alignOffset; break
    }

    setPosition({ top, left })
  }, [side, sideOffset, align, alignOffset, triggerRef])

  React.useEffect(() => {
    if (!open) return
    recalcPosition()
    // Recalc on next frame for settled layout, then make visible
    const raf = requestAnimationFrame(() => {
      recalcPosition()
      requestAnimationFrame(() => setPositioned(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [open, recalcPosition])

  // Close on scroll outside dropdown — allows scrolling inside dropdown content
  React.useEffect(() => {
    if (!open) return
    const closeOnScroll = (e: Event) => {
      if (contentRef.current?.contains(e.target as Node)) return
      onOpenChange(false)
    }
    window.addEventListener("scroll", closeOnScroll, true)
    return () => window.removeEventListener("scroll", closeOnScroll, true)
  }, [open, onOpenChange])

  // Click outside
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (contentRef.current?.contains(target)) return
      onOpenChange(false)
    }
    const id = setTimeout(() => document.addEventListener("pointerdown", handler), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener("pointerdown", handler)
    }
  }, [open, triggerRef, onOpenChange])

  // ESC
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      data-slot="select-content"
      data-side={side}
      data-open=""
      className={cn(
        "fixed z-50 max-h-60 w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-y-auto rounded-2xl bg-popover text-popover-foreground shadow-lg cine-scrollbar-thin",
        !positioned && "opacity-0 pointer-events-none",
        className,
      )}
      style={positioned ? { top: position.top, left: position.left } : undefined}
      {...props}
    >
      <SelectScrollUpButton />
      <div data-slot="select-list">{children}</div>
      <SelectScrollDownButton />
    </div>,
    document.body,
  )
}

// ─── Label ─────────────────────────────────────────────

function SelectLabel({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="select-label" className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)} {...props} />
}

// ─── Item ─────────────────────────────────────────────

function SelectItem({ className, children, value, ...props }: React.ComponentPropsWithoutRef<"div"> & { value?: string }) {
  const ctx = useSelectContext()
  const isSelected = ctx.value === value

  return (
    <div
      data-slot="select-item"
      data-selected={isSelected ? "" : undefined}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:text-accent hover:text-accent data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      onClick={() => {
        ctx.onValueChange?.(value ?? "")
        ctx.setSelectedLabel(children ? String(children) : "")
        ctx.onOpenChange(false)
      }}
      {...props}
    >
      <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</span>
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        {isSelected && <CheckIcon className="pointer-events-none" />}
      </span>
    </div>
  )
}

// ─── Separator ─────────────────────────────────────────

function SelectSeparator({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-separator"
      role="separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

// ─── Scroll Buttons ───────────────────────────────────

function SelectScrollUpButton({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="select-scroll-up-button" className={cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <ChevronUpIcon />
    </div>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="select-scroll-down-button" className={cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <ChevronDownIcon />
    </div>
  )
}

// ─── Exports ──────────────────────────────────────────

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
