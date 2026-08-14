"use client";

import { useActionState } from "react";
import { createProject, type ActionState } from "@/app/actions";
import { Field, inputClasses, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function NewProjectForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createProject,
    undefined
  );

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-ink-900">New Project</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="customerId" value={customerId} />

        <Field label="Project name" htmlFor="name" error={state?.error}>
          <input id="name" name="name" required className={inputClasses} placeholder="e.g. Mikocheni Residence Windows" />
        </Field>

        <Field label="Product category" htmlFor="projectType">
          <select id="projectType" name="projectType" className={inputClasses} defaultValue="Aluminium">
            <option value="Aluminium">Aluminium</option>
            <option value="PVC">PVC</option>
            <option value="Steel">Steel</option>
          </select>
        </Field>

        <Field label="Location (optional)" htmlFor="location">
          <input id="location" name="location" className={inputClasses} />
        </Field>

        <Field label="Description (optional)" htmlFor="description">
          <textarea id="description" name="description" rows={2} className={inputClasses + " py-3"} />
        </Field>

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </Card>
  );
}
