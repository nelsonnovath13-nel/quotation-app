"use client";

import { useTransition } from "react";
import { markQuotationStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";

const NEXT_STEPS: Record<string, { label: string; status: string; variant: "primary" | "secondary" | "danger" }[]> = {
  DRAFT: [{ label: "Mark as Sent", status: "SENT", variant: "primary" }],
  SENT: [
    { label: "Mark Approved", status: "APPROVED", variant: "primary" },
    { label: "Mark Rejected", status: "REJECTED", variant: "danger" },
  ],
  FOLLOW_UP: [
    { label: "Mark Approved", status: "APPROVED", variant: "primary" },
    { label: "Mark Rejected", status: "REJECTED", variant: "danger" },
  ],
};

export function StatusActions({ quotationId, currentStatus }: { quotationId: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();
  const actions = NEXT_STEPS[currentStatus];

  if (!actions) return null;

  return (
    <div className="flex gap-3">
      {actions.map((a) => (
        <Button
          key={a.status}
          variant={a.variant}
          fullWidth
          disabled={pending}
          onClick={() => startTransition(() => markQuotationStatus(quotationId, a.status))}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
