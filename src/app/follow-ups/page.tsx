import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("en-TZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function FollowUpsPage() {
  const company = await getCurrentCompany();
  const now = new Date();

  const followUps = await db.followUp.findMany({
    where: { quotation: { companyId: company.id } },
    include: { quotation: { include: { customer: true, project: true } } },
    orderBy: { followUpDate: "asc" },
  });

  const overdue = followUps.filter((item) => item.followUpDate <= now && item.status !== "COMPLETED");
  const upcoming = followUps.filter((item) => item.followUpDate > now && item.status !== "COMPLETED");
  const completed = followUps.filter((item) => item.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-primary-600">Sales pipeline</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-ink-500">Keep every quotation moving until the customer decides.</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <SummaryCard label="Overdue" value={overdue.length} />
        <SummaryCard label="Upcoming" value={upcoming.length} />
        <SummaryCard label="Completed" value={completed.length} />
      </div>

      <FollowUpGroup title="Needs attention" icon={<Bell size={18} aria-hidden />} items={overdue} empty="No overdue follow-ups." />
      <FollowUpGroup title="Upcoming" icon={<CheckCircle2 size={18} aria-hidden />} items={upcoming} empty="No upcoming follow-ups." />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3">
      <p className="text-2xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{label}</p>
    </Card>
  );
}

function FollowUpGroup({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    id: string;
    note: string;
    followUpDate: Date;
    status: string;
    quotation: {
      id: string;
      number: string;
      total: number;
      customer: { fullName: string; phone: string; whatsapp: string | null };
      project: { name: string };
    };
  }>;
  empty: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary-600">{icon}</span>
        <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      </div>
      {items.length === 0 ? (
        <Card><p className="text-sm text-ink-500">{empty}</p></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const contact = item.quotation.customer.whatsapp ?? item.quotation.customer.phone;
            const whatsappNumber = contact.replace(/\D/g, "");
            const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
            return (
              <Card key={item.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{item.quotation.customer.fullName}</p>
                    <p className="mt-1 text-sm text-ink-500">{item.quotation.number} · {item.quotation.project.name}</p>
                    <p className="mt-2 text-sm text-ink-700">{item.note}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-ink-600">
                    {dateFormatter.format(item.followUpDate)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/quotations/${item.quotation.id}`} className="flex-1">
                    <Button variant="secondary" fullWidth>Open quote <ArrowRight size={16} aria-hidden /></Button>
                  </Link>
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp customer" className="inline-flex min-h-11 items-center justify-center rounded-control border border-surface-200 px-3 text-ink-700 hover:bg-surface-50">
                      <MessageCircle size={18} aria-hidden />
                    </a>
                  ) : (
                    <a href={`tel:${item.quotation.customer.phone}`} aria-label="Call customer" className="inline-flex min-h-11 items-center justify-center rounded-control border border-surface-200 px-3 text-ink-700 hover:bg-surface-50">
                      <Phone size={18} aria-hidden />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
