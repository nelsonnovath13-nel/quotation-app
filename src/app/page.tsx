import Link from "next/link";
import { ArrowRight, Bell, BriefcaseBusiness, FileText, Plus, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const money = new Intl.NumberFormat("en-TZ", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const company = await getCurrentCompany();
  const now = new Date();

  const [customerCount, pendingQuotations, followUpsToday, jobsInProduction, sales, recentProjects, urgentFollowUps] =
    await Promise.all([
      db.customer.count({ where: { companyId: company.id } }),
      db.quotation.count({
        where: {
          companyId: company.id,
          status: { in: ["DRAFT", "SENT", "FOLLOW_UP", "NEGOTIATING"] },
        },
      }),
      db.followUp.count({
        where: { followUpDate: { lte: now }, quotation: { companyId: company.id } },
      }),
      db.project.count({ where: { companyId: company.id, status: "PRODUCTION" } }),
      db.quotation.aggregate({
        where: {
          companyId: company.id,
          status: "APPROVED",
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
        _sum: { total: true },
      }),
      db.project.findMany({
        where: { companyId: company.id },
        include: { customer: true, quotations: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      db.followUp.findMany({
        where: { quotation: { companyId: company.id }, followUpDate: { lte: now } },
        include: { quotation: { include: { customer: true } } },
        orderBy: { followUpDate: "asc" },
        take: 4,
      }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600">{company.brandName ?? company.name}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">Good morning</h1>
          <p className="mt-1 text-sm text-ink-500">Here is what needs your attention today.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<UserRound size={18} aria-hidden />} label="Customers" value={customerCount} />
        <StatCard icon={<FileText size={18} aria-hidden />} label="Pending quotes" value={pendingQuotations} />
        <StatCard icon={<Bell size={18} aria-hidden />} label="Follow-ups" value={followUpsToday} />
        <StatCard icon={<BriefcaseBusiness size={18} aria-hidden />} label="In production" value={jobsInProduction} />
      </div>

      <Card className="border-primary-100 bg-primary-50/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">Approved sales this month</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">
              {money.format(sales._sum.total ?? 0)}
            </p>
          </div>
          <div className="rounded-full bg-white p-3 text-primary-600 shadow-sm">
            <BriefcaseBusiness size={20} aria-hidden />
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/customers/new">
            <Button fullWidth><Plus size={17} aria-hidden /> Customer</Button>
          </Link>
          <Link href="/quotations">
            <Button variant="secondary" fullWidth><FileText size={17} aria-hidden /> Quotation</Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Needs attention</h2>
          <Link href="/follow-ups" className="text-sm font-medium text-primary-600">View all</Link>
        </div>
        {urgentFollowUps.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-500">No overdue follow-ups. You are up to date.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {urgentFollowUps.map((followUp) => (
              <Link key={followUp.id} href={`/quotations/${followUp.quotationId}`}>
                <Card className="flex items-center justify-between gap-3 transition-colors hover:bg-surface-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{followUp.quotation.customer.fullName}</p>
                    <p className="text-sm text-ink-500">Quotation {followUp.quotation.number} · {followUp.note}</p>
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
          <h2 className="text-base font-semibold text-ink-900">Recent projects</h2>
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
                    <p className="truncate text-sm text-ink-500">{project.customer.fullName} · {project.status}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {latestQuotation ? <p className="text-sm font-semibold text-ink-900">{money.format(latestQuotation.total)}</p> : null}
                    <p className="text-xs text-ink-400">{project.projectType}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
          {recentProjects.length === 0 && <Card><p className="text-sm text-ink-500">No projects yet.</p></Card>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-primary-500">{icon}</span>
      <span className="text-2xl font-semibold text-ink-900">{value}</span>
      <span className="text-sm text-ink-500">{label}</span>
    </Card>
  );
}
