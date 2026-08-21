import type { Metadata } from "next";
import Link from "next/link";
import { Bell, FileText, LayoutDashboard, UserRound } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotation & Job Management",
  description: "Smart quotation and job management for fabrication businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-5 sm:px-6">{children}</main>
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1 px-2 py-2 sm:px-6">
            <NavItem href="/" icon={<LayoutDashboard size={21} aria-hidden />} label="Home" />
            <NavItem href="/customers" icon={<UserRound size={21} aria-hidden />} label="Customers" />
            <NavItem href="/quotations" icon={<FileText size={21} aria-hidden />} label="Quotes" />
            <NavItem href="/follow-ups" icon={<Bell size={21} aria-hidden />} label="Follow-ups" />
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
      className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-control px-2 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-surface-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {icon}
      {label}
    </Link>
  );
}
