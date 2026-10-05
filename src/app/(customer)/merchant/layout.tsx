"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar, AdminTopbar } from "./_components/admin-sidebar";

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="am-empty" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <span className="am-spinner" style={{ color: "var(--am-text-faint)" }} />
      </div>
    );
  }

  return (
    <div className="am-admin-shell">
      <AdminSidebar />
      <div className="am-admin-main">
        <AdminTopbar title="Merchant" />
        <main className="am-admin-content">{children}</main>
      </div>
    </div>
  );
}
