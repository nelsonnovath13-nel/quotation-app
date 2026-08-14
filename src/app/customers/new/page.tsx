"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createCustomer, type ActionState } from "@/app/actions";
import { Field, inputClasses } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function NewCustomerPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCustomer,
    undefined
  );

  return (
    <div className="flex flex-col gap-4">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-ink-700">
        <ChevronLeft size={16} aria-hidden /> Customers
      </Link>
      <h1 className="text-xl font-semibold text-ink-900">Add Customer</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Full name" htmlFor="fullName" error={state?.error?.includes("name") ? state.error : undefined}>
          <input id="fullName" name="fullName" required autoComplete="name" className={inputClasses} placeholder="e.g. Grace Mushi" />
        </Field>

        <Field label="Phone number" htmlFor="phone" hint="Used for calls and quotation follow-up" error={state?.error?.includes("phone") ? state.error : undefined}>
          <input id="phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" className={inputClasses} placeholder="e.g. +255 712 345 678" />
        </Field>

        <Field label="WhatsApp number (optional)" htmlFor="whatsapp">
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" className={inputClasses} />
        </Field>

        <Field label="Email (optional)" htmlFor="email">
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className={inputClasses} />
        </Field>

        <Field label="Address (optional)" htmlFor="address">
          <input id="address" name="address" className={inputClasses} />
        </Field>

        <Field label="City (optional)" htmlFor="city">
          <input id="city" name="city" className={inputClasses} />
        </Field>

        <Field label="Project location (optional)" htmlFor="projectLocation" hint="Where the installation will happen, if different from address">
          <input id="projectLocation" name="projectLocation" className={inputClasses} />
        </Field>

        <Field label="Notes (optional)" htmlFor="notes">
          <textarea id="notes" name="notes" rows={3} className={inputClasses + " py-3"} />
        </Field>

        {state?.error && !state.error.includes("name") && !state.error.includes("phone") && (
          <p role="alert" className="text-sm font-medium text-danger">{state.error}</p>
        )}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Saving..." : "Save Customer"}
        </Button>
      </form>
    </div>
  );
}
