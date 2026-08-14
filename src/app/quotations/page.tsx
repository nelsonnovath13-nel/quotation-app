import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { formatMoney } from "@/lib/format";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";

export default async function QuotationsPage() {
  const company = await getCurrentCompany();
  const quotations = await db.quotation.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink-900">Quotations</h1>

      {quotations.length === 0 ? (
        <EmptyState
          title="No quotations yet."
          description="Add measurements to a project and generate your first quotation."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {quotations.map((q) => (
            <li key={q.id}>
              <Link href={`/quotations/${q.id}`}>
                <Card className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <FileText size={18} aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium text-ink-900">{q.number}</span>
                    <span className="text-sm text-ink-500">{q.customer.fullName}</span>
                  </span>
                  <span className="text-sm font-medium text-ink-900">{formatMoney(q.total, q.currency)}</span>
                  <StatusBadge status={q.status} />
                  <ChevronRight size={18} className="text-ink-500" aria-hidden />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
