import Link from "next/link";
import { ChevronLeft, ChevronRight, Briefcase, Phone, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { NewProjectForm } from "./new-project-form";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await db.customer.findUniqueOrThrow({
    where: { id: params.id },
    include: { projects: { orderBy: { updatedAt: "desc" } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-ink-700">
        <ChevronLeft size={16} aria-hidden /> Customers
      </Link>

      <Card>
        <h1 className="text-lg font-semibold text-ink-900">{customer.fullName}</h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <Phone size={14} aria-hidden /> {customer.phone}
        </p>
        {customer.projectLocation && (
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <MapPin size={14} aria-hidden /> {customer.projectLocation}
          </p>
        )}
      </Card>

      <h2 className="text-base font-semibold text-ink-900">Projects</h2>

      {customer.projects.length === 0 ? (
        <EmptyState
          title="No projects yet."
          description="Start a project to record measurements and create a quotation."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {customer.projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`}>
                <Card className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <Briefcase size={18} aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium text-ink-900">{p.name}</span>
                    <span className="text-sm text-ink-500">{p.projectType}</span>
                  </span>
                  <StatusBadge status={p.status} />
                  <ChevronRight size={18} className="text-ink-500" aria-hidden />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NewProjectForm customerId={customer.id} />
    </div>
  );
}
