import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentPropsWithoutRef<"hr"> & {
  orientation?: "horizontal" | "vertical"
}) {
  if (orientation === "vertical") {
    return (
      <div
        data-slot="separator"
        data-vertical=""
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "shrink-0 bg-border data-vertical:w-px data-vertical:self-stretch",
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<"div">)}
      />
    )
  }

  return (
    <hr
      data-slot="separator"
      data-horizontal=""
      aria-orientation="horizontal"
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
