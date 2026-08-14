"use client";

import { useActionState } from "react";
import { Calculator } from "lucide-react";
import { generateQuotation, type ActionState } from "@/app/actions";
import { Field, inputClasses, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function GenerateQuotationForm({ projectId, currency }: { projectId: string; currency: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    generateQuotation,
    undefined
  );

  return (
    <Card>
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-900">
        <Calculator size={18} aria-hidden /> Calculate & Generate Quotation
      </h2>
      <p className="mb-3 text-sm text-ink-500">
        The system will calculate material, glass, labour and installation costs automatically using current rates ({currency}).
      </p>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="projectId" value={projectId} />

        <Field label="Margin" htmlFor="marginPct" hint="Applied on top of total cost to set the selling price">
          <input id="marginPct" name="marginPct" type="number" inputMode="numeric" min={0} max={90} defaultValue={25} className={inputClasses} />
        </Field>

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger">{state.error}</p>
        )}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Calculating..." : "Calculate Price & Generate Quotation"}
        </Button>
      </form>
    </Card>
  );
}
