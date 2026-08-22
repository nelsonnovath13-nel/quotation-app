import Link from "next/link";
import { ChevronLeft, Download, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { StatusActions } from "./status-actions";

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const q = await db.quotation.findUniqueOrThrow({where:{id:params.id},include:{customer:true,project:true,items:true,company:true}});
  const whatsapp = (q.customer.whatsapp || q.customer.phone).replace(/[^0-9]/g,"");
  const message = encodeURIComponent(`Hello ${q.customer.fullName}, here is your quotation ${q.number} from ${q.company.brandName || q.company.name}. Total: ${formatMoney(q.total,q.currency)}. Valid until ${formatDate(q.validUntil)}. Thank you.`);
  const grouped = q.items.reduce<Record<string,typeof q.items>>((a,item)=>{const k=item.category||"Other";(a[k]??=[]).push(item);return a;},{});
  return <div className="flex flex-col gap-4">
    <Link href="/quotations" className="inline-flex items-center gap-1 text-sm text-ink-700"><ChevronLeft size={16}/> Quotations</Link>
    <Card className="flex items-start justify-between gap-3"><div><h1 className="text-lg font-semibold text-ink-900">{q.number}</h1><p className="text-sm text-ink-500">{q.customer.fullName} · {q.project.name}</p></div><StatusBadge status={q.status}/></Card>
    <Card><div className="grid grid-cols-2 gap-y-2 text-sm"><span className="text-ink-500">Date</span><span className="text-right">{formatDate(q.createdAt)}</span><span className="text-ink-500">Valid until</span><span className="text-right">{formatDate(q.validUntil)}</span><span className="font-semibold">Total</span><span className="text-right text-lg font-bold">{formatMoney(q.total,q.currency)}</span></div></Card>
    <Card><h2 className="mb-3 text-sm font-semibold">Quotation items</h2><div className="flex flex-col gap-4">{Object.entries(grouped).map(([category,items])=><section key={category}><h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-500">{category}</h3><div className="divide-y divide-slate-100">{items.map(item=><div key={item.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium text-ink-900">{item.ref} · {item.description}</p><p className="text-sm text-ink-500">{item.size} · Qty {item.quantity}</p></div><p className="shrink-0 font-semibold">{formatMoney(item.amount,q.currency)}</p></div>)}</div></section>)}</div><div className="mt-4 border-t pt-4"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatMoney(q.subtotal,q.currency)}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>Total</span><span>{formatMoney(q.total,q.currency)}</span></div></div></Card>
    <div className="grid grid-cols-2 gap-3"><a href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer"><Button fullWidth><MessageCircle size={18}/> WhatsApp</Button></a><a href={`tel:${q.customer.phone}`}><Button fullWidth variant="secondary"><Phone size={18}/> Call</Button></a></div>
    <a href={`/quotations/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"><Button fullWidth><Download size={18}/> Download PDF</Button></a>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={17}/> Ready to send</div><p className="mt-1">The PDF contains the stored quotation values, so later rate changes do not alter this quotation.</p></div>
    <StatusActions quotationId={q.id} currentStatus={q.status}/>
  </div>;
}
