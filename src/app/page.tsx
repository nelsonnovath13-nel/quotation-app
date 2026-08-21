import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const money = new Intl.NumberFormat("en-TZ", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-TZ", {
  day: "2-digit",
  month: "short",
});

export default async function DashboardPage() {
  const company = await getCurrentCompany();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [
    customerCount,
    openQuotationCount,
    overdueFollowUpCount,
    jobsInProduction,
    approvedSales,
    sentCount,
    negotiatingCount,
    approvedCount,
    recentProjects,
    urgentFollowUps,
  ] = await Promise.all([
    db.customer.count({ where: { companyId: company.id } }),
    db.quotation.count({
      where: {
        companyId: company.id,
        status: { in: ["DRAFT", "SENT", "FOLLOW_UP", "NEGOTIATING"] },
      },
    }),
    db.followUp.count({
      where: {
        quotation: { companyId: company.id },
        followUpDate: { lte: now },
        status: { not: "COMPLETED" },
      },
    }),
    db.project.count({ where: { companyId: company.id, status: "PRODUCTION" } }),
    db.quotation.aggregate({
      where: {
        companyId: company.id,
        status: "APPROVED",
        createdAt: { gte: monthStart },
      },
      _sum: { total: true },
    }),
    db.quotation.count({ where: { companyId: company.id, status: "SENT" } }),
    db.quotation.count({ where: { companyId: company.id, status: "NEGOTIATING" } }),
    db.quotation.count({ where: { companyId: company.id, status: "APPROVED" } }),
    db.project.findMany({
      where: { companyId: company.id },
      include: {
        customer: true,
        quotations: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.followUp.findMany({
      where: {
        quotation: { companyId: company.id },
        followUpDate: { lte: now },
        status: { not: "COMPLETED" },
      },
      include: { quotation: { include: { customer: true } } },
      orderBy: { followUpDate: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-primary-600">{company.brandName ?? company.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">{greeting}</h1>
        <p className="mt-1 text-sm text-ink-500">Here is what needs your attention today.</p>
      </header>

      <section aria-label="Business overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<UserRound size={18} aria-hidden />} label="Customers" value={customerCount} />
        <StatCard icon={<FileText size={18} aria-hidden />} label="Open quotations" value={openQuotationCount} />
        <StatCard icon={<Bell size={18} aria-hidden />} label="Overdue follow-ups" value={overdueFollowUpCount} alert={overdueFollowUpCount > 0} />
        <StatCard icon={<BriefcaseBusiness size={18} aria-hidden />} label="In production" value={jobsInProduction} />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-primary-100 bg-primary-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-500">Approved sales this month</p>
              <p className="mt-1 text-2xl font-semibold text-ink-900">
                {money.format(approvedSales._sum.total ?? 0)}
              </p>
              <p className="mt-2 text-xs text-ink-500">
                Based on approved quotations created this month.
              </p>
            </div>
            <div className="rounded-full bg-white p-3 text-primary-600 shadow-sm">
              <CheckCircle2 size={20} aria-hidden />
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Quotation pipeline</p>
              <p className="mt-0.5 text-xs text-ink-500">Where active quotes stand</p>
            </div>
            <Link href="/quotations" className="text-xs font-medium text-primary-600">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PipelineItem label="Sent" value={sentCount} />
            <PipelineItem label="Negotiating" value={negotiatingCount} />
            <PipelineItem label="Approved" value={approvedCount} />
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/customers/new">
            <Button fullWidth><Plus size={17} aria-hidden /> Customer</Button>
          </Link>
          <Link href="/quotations">
            <Button variant="secondary" fullWidth><FileText size={17} aria-hidden /> Quotations</Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Needs attention</h2>
            <p className="mt-0.5 text-xs text-ink-500">Follow-ups that are due or overdue</p>
          </div>
          <Link href="/follow-ups" className="text-sm font-medium text-primary-600">View all</Link>
        </div>
        {urgentFollowUps.length === 0 ? (
          <Card>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-surface-100 p-2 text-ink-500">
                <CheckCircle2 size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-ink-900">You are up to date</p>
                <p className="text-sm text-ink-500">No overdue follow-ups right now.</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {urgentFollowUps.map((followUp) => (
              <Link key={followUp.id} href={`/quotations/${followUp.quotationId}`}>
                <Card className="flex items-center justify-between gap-3 transition-colors hover:bg-surface-50">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-surface-100 p-2 text-ink-500">
                      <Clock3 size={16} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{followUp.quotation.customer.fullName}</p>
                      <p className="truncate text-sm text-ink-500">
                        Quotation {followUp.quotation.number} · {followUp.note}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        Due {dateFormatter.format(followUp.followUpDate)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-ink-400" aria-hidden />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Recent projects</h2>
            <p className="mt-0.5 text-xs text-ink-500">Latest project activity</p>
          </div>
          <Link href="/customers" className="text-sm font-medium text-primary-600">Customers</Link>
        </div>
        <div className="flex flex-col gap-2">
          {recentProjects.map((project) => {
            const latestQuotation = project.quotations[0];
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="flex items-center justify-between gap-3 transition-colors hover:bg-surface-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{project.name}</p>
                    <p className="truncate text-sm text-ink-500">
                      {project.customer.fullName} · {project.status}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {latestQuotation ? (
                      <p className="text-sm font-semibold text-ink-900">{money.format(latestQuotation.total)}</p>
                    ) : null}
                    <p className="text-xs text-ink-400">{project.projectType}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
          {recentProjects.length === 0 && (
            <Card><p className="text-sm text-ink-500">No projects yet.</p></Card>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Card className="flex min-h-[118px] flex-col justify-between gap-3">
      <span className={alert ? "text-amber-600" : "text-primary-500"}>{icon}</span>
      <div>
        <span className="text-2xl font-semibold text-ink-900">{value}</span>
        <p className="mt-1 text-sm text-ink-500">{label}</p>
      </div>
    </Card>
  );
}

function PipelineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control bg-surface-50 p-2.5 text-center">
      <p className="text-lg font-semibold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-500">{label}</p>
    </div>
  );
}
