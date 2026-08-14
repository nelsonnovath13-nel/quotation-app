import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 disabled:bg-primary-500/50",
  secondary:
    "bg-white text-ink-900 border border-surface-200 hover:bg-surface-50 focus-visible:ring-primary-500",
  ghost: "bg-transparent text-ink-700 hover:bg-surface-100 focus-visible:ring-primary-500",
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", fullWidth, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-control px-4 py-3 text-[15px] font-medium",
        "min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
