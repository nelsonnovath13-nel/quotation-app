import Link from "next/link";
import { Bell, FileText, UserRound, Briefcase } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const company = await getCurrentCompany();

  const [customerCount, pendingQuotations, followUpsToday, jobsInProduction] = await Promise.all([
    db.customer.count({ where: { companyId: company.id } }),
    db.quotation.count({ where: { companyId: company.id, status: { in: ["DRAFT", "SENT", "FOLLOW_UP", "NEGOTIATING"] } } }),
    db.followUp.count({ where: { followUpDate: { lte: new Date() }, quotation: { companyId: company.id } } }),
    db.project.count({ where: { companyId: company.id, status: "PRODUCTION" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-ink-500">{company.brandName ?? company.name}</p>
        <h1 className="text-xl font-semibold text-ink-900">Dashboard</h1>
      </header>

      <Link href="/customers/new">
        <Button fullWidth>
          <UserRound size={18} aria-hidden /> + New Customer
        </Button>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<UserRound size={18} aria-hidden />} label="Customers" value={customerCount} />
        <StatCard icon={<FileText size={18} aria-hidden />} label="Pending quotations" value={pendingQuotations} />
        <StatCard icon={<Bell size={18} aria-hidden />} label="Follow-ups today" value={followUpsToday} />
        <StatCard icon={<Briefcase size={18} aria-hidden />} label="In production" value={jobsInProduction} />
      </div>

      <div className="flex gap-3">
        <Link href="/quotations" className="flex-1">
          <Button variant="secondary" fullWidth>New Quotation</Button>
        </Link>
        <Link href="/quotations" className="flex-1">
          <Button variant="secondary" fullWidth>Follow-ups</Button>
        </Link>
      </div>
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
