"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// ─── Context ──────────────────────────────────────────────

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheetContext() {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>")
  return ctx
}

// ─── Animation helper ─────────────────────────────────────

type SheetAnimState = "entering" | "open" | "exiting" | null

const SHEET_TRANSITION_MS = 200

function useSheetAnimation(open: boolean) {
  const [mounted, setMounted] = React.useState(false)
  const [animState, setAnimState] = React.useState<SheetAnimState>(null)
  const mountedRef = React.useRef(false)

  React.useEffect(() => {
    if (open) {
      mountedRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true)
      setAnimState("entering")
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState("open")
        })
      })
      return () => cancelAnimationFrame(raf)
    } else if (mountedRef.current) {
      setAnimState("exiting")
      const timer = setTimeout(() => {
        mountedRef.current = false
        setMounted(false)
        setAnimState(null)
      }, SHEET_TRANSITION_MS)
      return () => clearTimeout(timer)
    }
  }, [open])

  return { mounted, animState }
}

function getSheetSidePosition(side: string, isOffset: boolean): string {
  const base = {
    bottom: "inset-x-0 bottom-0 h-auto border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    top: "inset-x-0 top-0 h-auto border-b",
  }[side] as string

  const offset = {
    bottom: "translate-y-[2.5rem]",
    left: "translate-x-[-2.5rem]",
    right: "translate-x-[2.5rem]",
    top: "translate-y-[-2.5rem]",
  }[side] as string

  return [base, isOffset ? offset : ""].filter(Boolean).join(" ")
}

// ─── Sheet ────────────────────────────────────────────────

function Sheet({
  open: openProp,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = openProp !== undefined ? openProp : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [openProp, onOpenChange],
  )

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

// ─── SheetTrigger ─────────────────────────────────────────

function SheetTrigger({
  children,
  render,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  render?: React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent) => void }>
}) {
  const { onOpenChange } = useSheetContext()

  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      "data-slot": "sheet-trigger",
      className: cn(className, render.props.className ?? ""),
      onClick: (e: React.MouseEvent) => {
        render.props.onClick?.(e)
        onOpenChange(true)
      },
      ...props,
    }, children)
  }

  return (
    <button
      data-slot="sheet-trigger"
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── SheetClose ───────────────────────────────────────────

function SheetClose({
  children,
  render,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  render?: React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent) => void }>
}) {
  const { onOpenChange } = useSheetContext()

  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      "data-slot": "sheet-close",
      className: cn(className, render.props.className ?? ""),
      onClick: (e: React.MouseEvent) => {
        render.props.onClick?.(e)
        onOpenChange(false)
      },
      ...props,
    }, children)
  }

  return (
    <button
      data-slot="sheet-close"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── SheetPortal (internal) ───────────────────────────────

function SheetPortal({ children }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}

// ─── SheetOverlay (internal) ──────────────────────────────

function SheetOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { onOpenChange } = useSheetContext()
  return (
    <div
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
}

// ─── SheetContent ─────────────────────────────────────────

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const { open, onOpenChange } = useSheetContext()
  const { mounted, animState } = useSheetAnimation(open)

  const isOffset = animState === "entering" || animState === "exiting"

  if (!mounted) return null

  return (
    <SheetPortal>
      <SheetOverlay />
      <div
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 text-sm shadow-lg transition duration-200 ease-in-out",
          getSheetSidePosition(side, isOffset),
          isOffset ? "opacity-0" : "opacity-100",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="sheet-close"
            className="absolute top-3 right-3"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </SheetPortal>
  )
}

// ─── SheetHeader ──────────────────────────────────────────

function SheetHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

// ─── SheetFooter ──────────────────────────────────────────

function SheetFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

// ─── SheetTitle ───────────────────────────────────────────

function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className,
      )}
      {...props}
    />
  )
}

// ─── SheetDescription ─────────────────────────────────────

function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
