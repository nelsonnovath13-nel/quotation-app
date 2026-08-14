import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { StatusActions } from "./status-actions";

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = await db.quotation.findUniqueOrThrow({
    where: { id: params.id },
    include: { customer: true, project: true, items: true, company: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <Link href="/quotations" className="inline-flex items-center gap-1 text-sm text-ink-700">
        <ChevronLeft size={16} aria-hidden /> Quotations
      </Link>

      <Card className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">{quotation.number}</h1>
          <p className="text-sm text-ink-500">{quotation.customer.fullName} · {quotation.project.name}</p>
        </div>
        <StatusBadge status={quotation.status} />
      </Card>

      <Card>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink-500">Date</dt>
          <dd className="text-right text-ink-900">{formatDate(quotation.createdAt)}</dd>
          <dt className="text-ink-500">Valid until</dt>
          <dd className="text-right text-ink-900">{formatDate(quotation.validUntil)}</dd>
          <dt className="text-ink-500">Total</dt>
          <dd className="text-right font-semibold text-ink-900">{formatMoney(quotation.total, quotation.currency)}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-900">Items</h2>
        <ul className="flex flex-col divide-y divide-surface-200">
          {quotation.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-ink-900">{item.ref} · {item.description}</p>
                <p className="text-ink-500">{item.size} · Qty {item.quantity}</p>
              </div>
              <p className="font-medium text-ink-900">{formatMoney(item.amount, quotation.currency)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <a href={`/quotations/${quotation.id}/pdf`} target="_blank" rel="noopener noreferrer">
        <Button fullWidth>
          <Download size={18} aria-hidden /> Download Quotation PDF
        </Button>
      </a>

      <StatusActions quotationId={quotation.id} currentStatus={quotation.status} />
    </div>
  );
}
