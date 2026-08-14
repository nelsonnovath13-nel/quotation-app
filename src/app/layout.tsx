import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, UserRound, FileText } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotation & Job Management",
  description: "Smart quotation and job management for fabrication businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">{children}</main>
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-10 border-t border-surface-200 bg-white"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-around py-2">
            <NavItem href="/" icon={<LayoutDashboard size={22} aria-hidden />} label="Dashboard" />
            <NavItem href="/customers" icon={<UserRound size={22} aria-hidden />} label="Customers" />
            <NavItem href="/quotations" icon={<FileText size={22} aria-hidden />} label="Quotations" />
          </div>
        </nav>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-w-[64px] flex-col items-center gap-1 rounded-control px-3 py-1.5 text-xs font-medium text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {icon}
      {label}
    </Link>
  );
}
