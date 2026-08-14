import Link from "next/link";
import { UserRound, Phone, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default async function CustomersPage() {
  const company = await getCurrentCompany();
  const customers = await db.customer.findMany({
    where: { companyId: company.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true, quotations: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-900">Customers</h1>
        <Link href="/customers/new">
          <Button>+ New</Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet."
          description="Add your first customer to start creating quotations."
          action={
            <Link href="/customers/new">
              <Button>Add Customer</Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {customers.map((c) => (
            <li key={c.id}>
              <Link href={`/customers/${c.id}`}>
                <Card className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <UserRound size={20} aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium text-ink-900">{c.fullName}</span>
                    <span className="flex items-center gap-1 text-sm text-ink-500">
                      <Phone size={14} aria-hidden /> {c.phone}
                    </span>
                  </span>
                  <span className="text-sm text-ink-500">{c._count.projects} projects</span>
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
