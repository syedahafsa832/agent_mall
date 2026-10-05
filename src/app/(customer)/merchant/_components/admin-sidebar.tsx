"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  IconBell, IconBolt, IconGavel, IconGlobe, IconGrid, IconLogout, IconReceipt, IconSearch, IconSettings, IconShield, LogoMark,
} from "@/lib/icons";

const NAV = [
  { group: "Store" },
  { href: "/merchant", label: "Dashboard", icon: IconGrid },
  { href: "/merchant/analytics", label: "Analytics", icon: IconReceipt },
  { href: "/merchant/billing", label: "Payments & Accounting", icon: IconBolt },
  { group: "Shopping" },
  { href: "/app", label: "Shop as customer", icon: IconGlobe },
  { href: "/app/search", label: "Search", icon: IconSearch },
  { href: "/app/auctions", label: "Auctions", icon: IconGavel },
  { group: "Account" },
  { href: "/merchant/connect", label: "Connect a website", icon: IconShield },
];

export function AdminTopbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  async function onLogout() {
    await logout();
    router.push("/login");
  }
  return (
    <header className="am-admin-topbar">
      <div>
        <strong style={{ fontSize: 15 }}>{title}</strong>
      </div>
      <div className="am-admin-search">
        <IconSearch width={14} height={14} />
        Search anything…
      </div>
      <div className="am-admin-topbar-tools">
        <button className="am-admin-icon-btn" aria-label="Notifications"><IconBell width={16} height={16} /></button>
        <button className="am-admin-icon-btn" aria-label="Sign out" onClick={onLogout} title={user?.email ?? ""}><IconLogout width={16} height={16} /></button>
      </div>
    </header>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="am-admin-sidebar">
      <Link href="/merchant" className="am-brand"><LogoMark />Agent Mall</Link>
      <nav>
        {NAV.map((item, i) =>
          "group" in item ? (
            <div className="am-admin-nav-group" key={`g-${i}`}>{item.group}</div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`am-admin-nav-item ${pathname === item.href ? "active" : ""}`}
            >
              <item.icon width={16} height={16} />
              {item.label}
            </Link>
          ),
        )}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <Link href="/app/profile" className="am-admin-nav-item"><IconSettings width={16} height={16} />Profile settings</Link>
      </div>
    </aside>
  );
}
