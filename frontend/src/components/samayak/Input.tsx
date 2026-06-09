import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border-2 border-transparent bg-[#eef2f8] px-4.5 py-3 text-[16px] sm:text-[14.5px] text-ink ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:bg-white focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          error ? "bg-[#fdecee] border-error text-error focus-visible:ring-error/20" : "",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
