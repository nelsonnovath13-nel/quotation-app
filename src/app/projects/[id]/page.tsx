import Link from "next/link";
import { ChevronLeft, Ruler, FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { AddMeasurementForm } from "./add-measurement-form";
import { GenerateQuotationForm } from "./generate-quotation-form";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await db.project.findUniqueOrThrow({where:{id:params.id},include:{customer:true,measurementItems:{orderBy:{createdAt:"asc"}},quotations:{orderBy:{createdAt:"desc"}}}});
  const grouped = project.measurementItems.reduce<Record<string,typeof project.measurementItems>>((acc,m)=>{ const key = m.productName.split(" ")[0] === "PVC" ? "PVC" : m.productName.toLowerCase().includes("shower") || m.productName.toLowerCase().includes("glass") ? "Shower / Glass" : "Aluminium"; (acc[key]??=[]).push(m); return acc; },{});
  return <div className="flex flex-col gap-4">
    <Link href={`/customers/${project.customerId}`} className="inline-flex items-center gap-1 text-sm text-ink-700"><ChevronLeft size={16}/> {project.customer.fullName}</Link>
    <Card className="flex items-start justify-between gap-3"><div><h1 className="text-lg font-semibold text-ink-900">{project.name}</h1><p className="text-sm text-ink-500">{project.location || project.projectType}</p></div><StatusBadge status={project.status}/></Card>
    {project.quotations.length>0 && <div className="flex flex-col gap-2"><h2 className="flex items-center gap-2 text-base font-semibold text-ink-900"><FileText size={18}/> Quotations</h2>{project.quotations.map(q=><Link key={q.id} href={`/quotations/${q.id}`}><Card className="flex items-center justify-between"><span className="font-medium">{q.number}</span><span className="text-sm font-semibold">TZS {q.total.toLocaleString()}</span></Card></Link>)}</div>}
    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold text-ink-900"><Ruler size={18}/> Items & measurements</h2><span className="text-xs text-ink-500">{project.measurementItems.length} lines</span></div>
    {project.measurementItems.length===0 ? <EmptyState title="No measurements yet." description="Add the first window, door or glass item below."/> : <div className="flex flex-col gap-3">{Object.entries(grouped).map(([category,items])=><Card key={category}><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-ink-900">{category}</h3><span className="text-xs text-ink-500">{items.length} lines</span></div><div className="divide-y divide-slate-100">{items.map(m=><div key={m.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium text-ink-900">{m.ref} · {m.productName}</p><p className="text-sm text-ink-500">{m.widthMm} × {m.heightMm} mm · Qty {m.quantity}</p><p className="text-xs text-ink-400">{m.notes || "No note"}</p></div><span className="shrink-0 text-xs font-medium text-ink-500">{String((m.spec as {glass?:string})?.glass || "Standard")}</span></div>)}</div></Card>)}</div>}
    <AddMeasurementForm projectId={project.id}/>
    {project.measurementItems.length>0 && <GenerateQuotationForm projectId={project.id} currency="TZS"/>}
    <Link href={`/customers/${project.customerId}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium"><Plus size={16}/> Back to customer</Link>
  </div>;
}
