"use client";
import { useActionState, useState } from "react";
import { addMeasurement, type ActionState } from "@/app/actions";
import { Field, inputClasses, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const products = [
  ["Aluminium","ALU_SLIDING_WINDOW","Sliding Window"],["Aluminium","ALU_CASEMENT_WINDOW","Casement Window"],
  ["Aluminium","ALU_DOOR","Aluminium Door"],["Aluminium","ALU_SLIDING_DOOR","Sliding Door"],
  ["Aluminium","ALU_SHOP_FRONT","Shop Front"],["Aluminium","ALU_PARTITION","Partition"],
  ["PVC","PVC_WINDOW","PVC Window"],["PVC","PVC_DOOR","PVC Door"],
  ["Shower / Glass","SHOWER_DOOR","Shower Door"],["Shower / Glass","GLASS_RAILING","Glass Railing"],
] as const;

export function AddMeasurementForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addMeasurement, undefined);
  const [productKey,setProductKey] = useState(products[0][1]);
  const selected = products.find(p=>p[1]===productKey) ?? products[0];
  const glassOptions = selected[1].includes("SHOWER") || selected[1].includes("RAILING") ? ["8mm Tempered","10mm Tempered","12mm Tempered"] : ["5mm Clear","5mm Tinted","6mm Clear"];
  return <Card>
    <h2 className="mb-1 text-base font-semibold text-ink-900">Add item</h2>
    <p className="mb-4 text-sm text-ink-500">One project can contain windows, doors, PVC and glass together.</p>
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId}/>
      <Field label="Product" htmlFor="productKey">
        <select id="productKey" name="productKey" value={productKey} onChange={e=>setProductKey(e.target.value)} className={inputClasses}>
          {products.map(p=><option key={p[1]} value={p[1]}>{p[0]} · {p[2]}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Width" htmlFor="widthMm" hint="mm"><input id="widthMm" name="widthMm" required type="number" min={1} inputMode="numeric" className={inputClasses} placeholder="1200"/></Field>
        <Field label="Height" htmlFor="heightMm" hint="mm"><input id="heightMm" name="heightMm" required type="number" min={1} inputMode="numeric" className={inputClasses} placeholder="1500"/></Field>
      </div>
      <Field label="Quantity" htmlFor="quantity"><input id="quantity" name="quantity" required type="number" min={1} defaultValue={1} inputMode="numeric" className={inputClasses}/></Field>
      <Field label="Glass / specification" htmlFor="glass"><select id="glass" name="glass" className={inputClasses}>{glassOptions.map(g=><option key={g}>{g}</option>)}</select></Field>
      <Field label="Location / notes" htmlFor="notes"><input id="notes" name="notes" className={inputClasses} placeholder="e.g. Main entrance, W01"/></Field>
      {state?.error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      <Button type="submit" fullWidth disabled={pending}>{pending ? "Saving..." : `Add ${selected[2]}`}</Button>
    </form>
  </Card>;
}
