"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// ─── Context ──────────────────────────────────────────────

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>")
  return ctx
}

// ─── Dialog ───────────────────────────────────────────────

function Dialog({
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
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

// ─── DialogTrigger ────────────────────────────────────────

function DialogTrigger({
  children,
  render,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  render?: React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent) => void }>
}) {
  const { onOpenChange } = useDialogContext()

  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      "data-slot": "dialog-trigger",
      onClick: (e: React.MouseEvent) => {
        render.props.onClick?.(e)
        onOpenChange(true)
      },
      ...props,
    }, children)
  }

  return (
    <button data-slot="dialog-trigger" onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

// ─── DialogPortal ─────────────────────────────────────────

function DialogPortal({ children }: { children?: React.ReactNode }) {
  const { open } = useDialogContext()
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted || !open) return null
  return createPortal(children, document.body)
}

// ─── DialogClose ──────────────────────────────────────────

function DialogClose({
  children,
  render,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  render?: React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent) => void }>
}) {
  const { onOpenChange } = useDialogContext()

  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React.cloneElement as any)(render, {
      "data-slot": "dialog-close",
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
      data-slot="dialog-close"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── DialogOverlay ────────────────────────────────────────

function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { onOpenChange } = useDialogContext()
  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
}

// ─── DialogContent ────────────────────────────────────────

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"dialog">, "open"> & {
  showCloseButton?: boolean
}) {
  const { open, onOpenChange } = useDialogContext()
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const [mountedPortal, setMountedPortal] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountedPortal(true)
  }, [])

  // Manage showModal()/close() lifecycle
  React.useEffect(() => {
    const el = dialogRef.current
    if (!el || !mountedPortal) return

    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open, mountedPortal])

  // Handle native cancel event (ESC key)
  React.useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onOpenChange(false)
    }

    el.addEventListener("cancel", handleCancel)
    return () => el.removeEventListener("cancel", handleCancel)
  }, [onOpenChange])

  // Click-outside detection via backdrop click (rect-based)
  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const el = dialogRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const clickOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      if (clickOutside) onOpenChange(false)
    },
    [onOpenChange],
  )

  const content = (
    <>
      {/* ::backdrop styles for the native dialog */}
      <style>{`
        dialog[data-slot="dialog-content"]::backdrop {
          background: rgba(0, 0, 0, 0.1);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
        }
      `}</style>
      <dialog
        ref={dialogRef}
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-popover p-4 text-sm text-popover-foreground shadow-lg duration-100 outline-none sm:max-w-sm",
          className,
        )}
        onClick={handleBackdropClick}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="dialog-close"
            className="absolute top-2 right-2"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </dialog>
    </>
  )

  if (!mountedPortal) return null

  return createPortal(content, document.body)
}

// ─── DialogHeader ─────────────────────────────────────────

function DialogHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

// ─── DialogFooter ─────────────────────────────────────────

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── DialogTitle ──────────────────────────────────────────

function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

// ─── DialogDescription ────────────────────────────────────

function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
