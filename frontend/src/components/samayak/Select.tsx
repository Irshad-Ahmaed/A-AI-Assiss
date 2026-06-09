import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-11 w-full appearance-none rounded-pill border-2 border-transparent bg-[#eef2f8] px-4.5 py-3 text-[16px] sm:text-[14.5px] text-ink ring-offset-white focus-visible:outline-none focus-visible:bg-white focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          error ? "bg-[#fdecee] border-error text-error focus-visible:ring-error/20" : "",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
