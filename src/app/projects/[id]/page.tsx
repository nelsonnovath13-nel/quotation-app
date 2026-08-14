import Link from "next/link";
import { ChevronLeft, Ruler, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { AddMeasurementForm } from "./add-measurement-form";
import { GenerateQuotationForm } from "./generate-quotation-form";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      customer: true,
      measurementItems: { orderBy: { createdAt: "asc" } },
      quotations: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/customers/${project.customerId}`} className="inline-flex items-center gap-1 text-sm text-ink-700">
        <ChevronLeft size={16} aria-hidden /> {project.customer.fullName}
      </Link>

      <Card className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">{project.name}</h1>
          <p className="text-sm text-ink-500">{project.projectType}</p>
        </div>
        <StatusBadge status={project.status} />
      </Card>

      {project.quotations.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <FileText size={18} aria-hidden /> Quotations
          </h2>
          {project.quotations.map((q) => (
            <Link key={q.id} href={`/quotations/${q.id}`}>
              <Card className="flex items-center justify-between">
                <span className="font-medium text-ink-900">{q.number}</span>
                <StatusBadge status={q.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}

      <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
        <Ruler size={18} aria-hidden /> Measurements
      </h2>

      {project.measurementItems.length === 0 ? (
        <EmptyState
          title="No measurements yet."
          description="Add the window or door sizes for this project to calculate a price."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {project.measurementItems.map((m) => (
            <li key={m.id}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">
                    {m.ref} · {m.productName}
                  </p>
                  <p className="text-sm text-ink-500">
                    {m.widthMm} × {m.heightMm} mm · Qty {m.quantity}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AddMeasurementForm projectId={project.id} />

      {project.measurementItems.length > 0 && (
        <GenerateQuotationForm projectId={project.id} currency="TZS" />
      )}
    </div>
  );
}
