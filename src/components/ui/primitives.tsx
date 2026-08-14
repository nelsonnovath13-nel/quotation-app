import { clsx } from "clsx";
import { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-surface-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  NEW: "bg-surface-100 text-ink-700",
  MEASUREMENT: "bg-primary-50 text-primary-600",
  QUOTATION: "bg-primary-50 text-primary-600",
  FOLLOW_UP: "bg-amber-50 text-warning",
  APPROVED: "bg-green-50 text-success",
  PRODUCTION: "bg-primary-50 text-primary-600",
  INSTALLATION: "bg-primary-50 text-primary-600",
  COMPLETED: "bg-green-50 text-success",
  CANCELLED: "bg-red-50 text-danger",
  DRAFT: "bg-surface-100 text-ink-700",
  SENT: "bg-primary-50 text-primary-600",
  NEGOTIATING: "bg-amber-50 text-warning",
  REJECTED: "bg-red-50 text-danger",
  EXPIRED: "bg-red-50 text-danger",
};

// Status is communicated with an icon-free but distinct label + shape, not
// color alone (WCAG 1.4.1) — pair with the `label` prop text in context.
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-current/10 px-2.5 py-1 text-xs font-semibold",
        statusStyles[status] ?? "bg-surface-100 text-ink-700"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-surface-200 px-6 py-12 text-center">
      <p className="text-base font-semibold text-ink-900">{title}</p>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
  error,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "min-h-[44px] w-full rounded-control border border-surface-200 bg-white px-3.5 text-[16px] text-ink-900 " +
  "placeholder:text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
