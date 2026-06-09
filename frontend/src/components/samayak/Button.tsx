import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "white" | "ghost" | "dark";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50 active:scale-95 shadow-sm gap-2",
          {
            "bg-linear-to-r from-brand-deep to-brand-blue text-white hover:opacity-90 shadow-md":
              variant === "primary",
            "bg-white text-ink hover:bg-line/50 border border-line": variant === "white",
            "bg-transparent text-brand-deep hover:bg-canvas-2 border-2 border-line-2 shadow-none":
              variant === "ghost",
            "bg-black text-white hover:bg-ink": variant === "dark",
            "h-11 px-5 sm:px-6 py-2": size === "default",
            "h-9 px-4 text-xs rounded-xl": size === "sm",
            "h-14 px-8 text-base rounded-[20px]": size === "lg",
            "h-11 w-11 p-2": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
