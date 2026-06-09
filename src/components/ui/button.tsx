import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-[17px] font-normal tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-accent-hover active:brightness-90",
        outline:
          "border-border bg-background text-foreground hover:bg-white/5 hover:border-primary/30 hover:text-primary aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-110 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-foreground/80 hover:text-primary",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-[21px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-[11px] text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-[15px] text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-[23px] text-[17px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string
  render?: React.ReactElement<{ className?: string; "data-slot"?: string }>
  nativeButton?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton = true,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }))

  if (render) {
    return React.cloneElement(
      render,
      {
        className: cn(classes, render.props.className),
        "data-slot": render.props["data-slot"] ?? "button",
      },
      children
    )
  }

  if (!nativeButton) {
    return (
      <div
        role="button"
        tabIndex={0}
        data-slot="button"
        className={classes}
        {...(props as React.ComponentPropsWithoutRef<"div">)}
      >
        {children}
      </div>
    )
  }

  return (
    <button data-slot="button" className={classes} {...props}>
      {children}
    </button>
  )
}

export { Button, buttonVariants }
