"use client";

import { useActionState } from "react";
import { addMeasurement, type ActionState } from "@/app/actions";
import { Field, inputClasses, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function AddMeasurementForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addMeasurement,
    undefined
  );

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-ink-900">Add Measurement</h2>
      <p className="mb-3 text-sm text-ink-500">Aluminium Sliding Window</p>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="projectId" value={projectId} />

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="Width" htmlFor="widthMm" hint="mm" error={state?.error?.includes("width") ? state.error : undefined}>
              <input id="widthMm" name="widthMm" required type="number" inputMode="numeric" min={1} className={inputClasses} placeholder="1200" />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Height" htmlFor="heightMm" hint="mm" error={state?.error?.includes("height") ? state.error : undefined}>
              <input id="heightMm" name="heightMm" required type="number" inputMode="numeric" min={1} className={inputClasses} placeholder="1500" />
            </Field>
          </div>
        </div>

        <Field label="Quantity" htmlFor="quantity" error={state?.error?.includes("many") ? state.error : undefined}>
          <input id="quantity" name="quantity" required type="number" inputMode="numeric" min={1} defaultValue={1} className={inputClasses} />
        </Field>

        <Field label="Glass" htmlFor="glass">
          <select id="glass" name="glass" className={inputClasses} defaultValue="5mm Clear">
            <option value="5mm Clear">5mm Clear</option>
            <option value="5mm Tinted">5mm Tinted</option>
            <option value="6mm Clear">6mm Clear</option>
          </select>
        </Field>

        <Field label="Notes (optional)" htmlFor="notes">
          <input id="notes" name="notes" className={inputClasses} placeholder="e.g. Ground floor" />
        </Field>

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Adding..." : "Add Measurement"}
        </Button>
      </form>
    </Card>
  );
}
