"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiGet } from "@/lib/api";
import type { AuthorizationRow, MerchantRow } from "@/lib/types";
import {
  IconArrowRight, IconBolt, IconCart, IconCheck, IconCompass, IconGlobe, IconSearch, IconShield, IconStore, IconTag, IconX,
} from "@/lib/icons";
import { getStoreBrand } from "@/lib/store-brand";
import { KeywordManager } from "./_components/keyword-manager";
import { VisitPackagesCard } from "./_components/visit-packages-card";
import { PoliciesCard } from "./_components/policies-card";

const READ_SCOPES = ["products", "inventory", "shipping", "returns", "warranty"];
const ACTION_INFO: { key: string; label: string; icon: typeof IconSearch; alwaysOn?: boolean; needsApproval?: boolean }[] = [
  { key: "search", label: "Search", icon: IconSearch, alwaysOn: true },
  { key: "navigate", label: "Navigate", icon: IconCompass, alwaysOn: true },
  { key: "cart", label: "Add to cart", icon: IconCart },
  { key: "checkout", label: "Purchase", icon: IconTag, needsApproval: true },
];

function statusTone(status: string) {
  if (status === "authorized") return "am-badge-success";
  if (status === "revoked") return "am-badge-danger";
  return "am-badge-warning";
}

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [myWebsites, setMyWebsites] = useState<MerchantRow[] | null>(null);
  const [merchant, setMerchant] = useState<MerchantRow | null>(null);
  const [authorization, setAuthorization] = useState<AuthorizationRow | null>(null);
  const [productCount, setProductCount] = useState<number | null | "unavailable">(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ merchants: MerchantRow[] }>("/api/merchants")
      .then((res) => setMyWebsites(res.merchants.filter((m) => m.owner_id === user?.id)))
      .catch(() => setMyWebsites([]));
  }, [user?.id]);

  const activeId = requestedId ?? myWebsites?.[0]?.id ?? null;

  useEffect(() => {
    if (!activeId) return;
    apiGet<{ merchant: MerchantRow; authorization: AuthorizationRow | null }>(`/api/merchants/${activeId}`)
      .then((res) => {
        setMerchant(res.merchant);
        setAuthorization(res.authorization);
        apiGet<{ count: number; synced?: boolean }>(`/api/merchants/${activeId}/products`)
          .then((r) => setProductCount(r.synced === false ? "unavailable" : r.count))
          .catch(() => setProductCount("unavailable"));
      })
      .catch(() => setLoadError("Couldn't load this merchant."));
  }, [activeId]);

  if (myWebsites === null) {
    return <div className="am-empty">Loading…</div>;
  }

  if (myWebsites.length === 0) {
    return (
      <div className="am-card" style={{ maxWidth: 480, textAlign: "center", padding: 40 }}>
        <span className="am-feature-icon" style={{ margin: "0 auto 14px" }}><IconStore width={20} height={20} /></span>
        <h2 className="am-modal-title">No websites connected yet</h2>
        <p className="am-auth-subtitle">Connect your store to make it available to shopping agents.</p>
        <Link href="/merchant/connect" className="am-btn am-btn-primary" style={{ textDecoration: "none" }}>
          Connect a website <IconArrowRight width={15} height={15} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="am-row-between" style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div className="am-section-head" style={{ marginBottom: 0 }}>
          <h1>Merchant dashboard</h1>
          <p>What agents can see and do on your connected store.</p>
        </div>
        {myWebsites.length > 1 && (
          <select className="am-select" style={{ width: "auto" }} value={activeId ?? ""} onChange={(e) => router.push(`/merchant?id=${e.target.value}`)}>
            {myWebsites.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>

      {loadError && <p className="am-error-text" role="alert">{loadError}</p>}

      {merchant && (
        <>
          <section className="am-card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              {(() => { const brand = getStoreBrand(merchant.slug); const Icon = brand.icon; return <span className="am-feature-icon" style={{ background: brand.bg, color: brand.color }}><Icon width={20} height={20} /></span>; })()}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{merchant.name}</div>
                <div style={{ fontSize: 13, color: "var(--am-text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <IconGlobe width={13} height={13} />{merchant.domain}
                </div>
              </div>
              <span className={`am-badge ${statusTone(merchant.status)}`}>{merchant.status.replace("_", " ")}</span>
              <Link href={`/merchant/analytics?id=${merchant.id}`} className="am-btn am-btn-secondary am-btn-sm" style={{ textDecoration: "none" }}>View analytics</Link>
            </div>

            <div className="am-stat-grid">
              <div className="am-stat-card">
                <div className="am-stat-label">Products</div>
                <div className="am-stat-value">{productCount === "unavailable" || productCount === null ? "—" : productCount}</div>
                {productCount === "unavailable" && <div className="am-stat-trend">Not synced yet</div>}
              </div>
              <div className="am-stat-card">
                <div className="am-stat-label">Category</div>
                <div className="am-stat-value" style={{ fontSize: 15 }}>{merchant.category}</div>
              </div>
              <div className="am-stat-card">
                <div className="am-stat-label">Connector</div>
                <div className="am-stat-value" style={{ fontSize: 15, textTransform: "uppercase" }}>{merchant.connector_type}</div>
              </div>
              <div className="am-stat-card">
                <div className="am-stat-label">Permissions granted</div>
                <div className="am-stat-value">{authorization?.scopes.length ?? 0}</div>
              </div>
            </div>
          </section>

          <div style={{ marginBottom: 20 }}>
            <PoliciesCard merchantId={merchant.id} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <VisitPackagesCard merchantId={merchant.id} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <KeywordManager merchantId={merchant.id} />
          </div>

          <div className="am-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <section className="am-card">
              <h2 className="am-modal-title">Read access</h2>
              <p className="am-auth-subtitle">What agents can see.</p>
              {READ_SCOPES.map((scope) => {
                const on = (authorization?.scopes as string[] | undefined)?.includes(scope) ?? false;
                return (
                  <div className="am-list-row" key={scope}>
                    <span className="am-list-row-icon"><IconShield width={15} height={15} /></span>
                    <span className="am-list-row-body"><span className="am-list-row-title" style={{ textTransform: "capitalize" }}>{scope}</span></span>
                    {on ? <IconCheck width={16} height={16} style={{ color: "var(--am-success-text)" }} /> : <IconX width={16} height={16} style={{ color: "var(--am-text-faint)" }} />}
                  </div>
                );
              })}
            </section>

            <section className="am-card">
              <h2 className="am-modal-title">Agent actions</h2>
              <p className="am-auth-subtitle">What agents can do.</p>
              {ACTION_INFO.map((a) => {
                const Icon = a.icon;
                const on = a.alwaysOn || ((authorization?.scopes as string[] | undefined)?.includes("checkout") ?? false);
                return (
                  <div className="am-list-row" key={a.key}>
                    <span className="am-list-row-icon"><Icon width={15} height={15} /></span>
                    <span className="am-list-row-body">
                      <span className="am-list-row-title">{a.label}</span>
                      {a.needsApproval && <span className="am-list-row-sub">Always requires shopper approval</span>}
                    </span>
                    {a.alwaysOn ? (
                      <span className="am-badge am-badge-neutral">Always on</span>
                    ) : on ? (
                      <IconCheck width={16} height={16} style={{ color: "var(--am-success-text)" }} />
                    ) : (
                      <IconX width={16} height={16} style={{ color: "var(--am-text-faint)" }} />
                    )}
                  </div>
                );
              })}
            </section>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <Link href={`/merchant/connect`} className="am-btn am-btn-ghost am-btn-sm" style={{ textDecoration: "none" }}>
              <IconBolt width={14} height={14} />Connect another website
            </Link>
            <Link href={`/merchant/billing`} className="am-btn am-btn-ghost am-btn-sm" style={{ textDecoration: "none" }}>
              Payments &amp; accounting
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
