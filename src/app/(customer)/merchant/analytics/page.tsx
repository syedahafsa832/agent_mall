"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiGet, ApiError } from "@/lib/api";
import type { MerchantRow } from "@/lib/types";
import { IconChart, IconGavel, IconGlobe, IconSearch, IconStore, IconTag } from "@/lib/icons";

interface CriterionCount { criterion: string; count: number }
interface MerchantAnalytics {
  searches: number;
  productViews: number;
  productsMatched: number;
  productsExcluded: number;
  productsCompared: number;
  uniqueVisits: number;
  merchantInteractions: number;
  auctionViews: number;
  auctionBids: number;
  auctionBuyNows: number;
  checkoutsStarted: number;
  checkoutsAbandoned: number;
  topRequestedCriteria: CriterionCount[];
  exclusions: CriterionCount[];
}

const FUNNEL: { key: keyof MerchantAnalytics; label: string }[] = [
  { key: "searches", label: "Search" },
  { key: "productsMatched", label: "Matched" },
  { key: "productsCompared", label: "Compared" },
  { key: "merchantInteractions", label: "Visited" },
  { key: "productViews", label: "Viewed product" },
  { key: "checkoutsStarted", label: "Checkout" },
  { key: "checkoutsAbandoned", label: "Abandoned" },
];

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 4 : 0) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="am-row-between" style={{ fontSize: 12.5, marginBottom: 4 }}>
        <span style={{ color: "var(--am-text-muted)" }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--am-surface-muted)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg, var(--am-accent), var(--am-accent-hover))", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export default function MerchantAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [myWebsites, setMyWebsites] = useState<MerchantRow[] | null>(null);
  const [merchant, setMerchant] = useState<MerchantRow | null>(null);
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ merchants: MerchantRow[] }>("/api/merchants")
      .then((res) => setMyWebsites(res.merchants.filter((m) => m.owner_id === user?.id)))
      .catch(() => setMyWebsites([]));
  }, [user?.id]);

  const activeId = requestedId ?? myWebsites?.[0]?.id ?? null;

  useEffect(() => {
    if (!activeId) return;
    setError(null);
    apiGet<{ merchant: MerchantRow }>(`/api/merchants/${activeId}`).then((res) => setMerchant(res.merchant)).catch(() => {});
    apiGet<MerchantAnalytics>(`/api/merchants/${activeId}/analytics`)
      .then(setAnalytics)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load analytics — you may not own this merchant."));
  }, [activeId]);

  if (myWebsites === null) return <div className="am-empty">Loading…</div>;

  if (myWebsites.length === 0) {
    return (
      <div className="am-card" style={{ maxWidth: 480, textAlign: "center", padding: 40 }}>
        <h2 className="am-modal-title">No connected websites yet</h2>
        <p className="am-auth-subtitle">Connect a store first to see its analytics.</p>
        <Link href="/merchant/connect" className="am-btn am-btn-primary" style={{ textDecoration: "none" }}>Connect a website</Link>
      </div>
    );
  }

  const maxFunnel = analytics ? Math.max(...FUNNEL.map((f) => analytics[f.key] as number), 1) : 1;
  const maxCriteria = analytics ? Math.max(...analytics.topRequestedCriteria.map((c) => c.count), 1) : 1;
  const maxExclusions = analytics ? Math.max(...analytics.exclusions.map((c) => c.count), 1) : 1;

  return (
    <div>
      <div className="am-row-between" style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div className="am-section-head" style={{ marginBottom: 0 }}>
          <h1>Analytics {merchant ? `· ${merchant.name}` : ""}</h1>
          <p>Real shopping activity from your store&apos;s event stream — nothing here is simulated.</p>
        </div>
        {myWebsites.length > 1 && (
          <select className="am-select" style={{ width: "auto" }} value={activeId ?? ""} onChange={(e) => router.push(`/merchant/analytics?id=${e.target.value}`)}>
            {myWebsites.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>

      {error && <p className="am-error-text" role="alert">{error}</p>}

      {analytics && (
        <>
          <div className="am-stat2-grid" style={{ marginBottom: 20 }}>
            <div className="am-stat2-card">
              <div className="am-stat2-head"><span className="am-stat2-icon"><IconSearch width={15} height={15} /></span></div>
              <div className="am-stat2-value">{analytics.searches}</div>
              <div className="am-stat2-label">Searches</div>
            </div>
            <div className="am-stat2-card">
              <div className="am-stat2-head"><span className="am-stat2-icon"><IconStore width={15} height={15} /></span></div>
              <div className="am-stat2-value">{analytics.productViews}</div>
              <div className="am-stat2-label">Product views</div>
            </div>
            <div className="am-stat2-card">
              <div className="am-stat2-head"><span className="am-stat2-icon"><IconGlobe width={15} height={15} /></span></div>
              <div className="am-stat2-value">{analytics.uniqueVisits}</div>
              <div className="am-stat2-label">Unique visits</div>
            </div>
            <div className="am-stat2-card">
              <div className="am-stat2-head"><span className="am-stat2-icon"><IconTag width={15} height={15} /></span></div>
              <div className="am-stat2-value">{analytics.checkoutsStarted > 0 ? `${Math.round((analytics.checkoutsAbandoned / analytics.checkoutsStarted) * 100)}%` : "—"}</div>
              <div className="am-stat2-label">Checkout abandonment</div>
            </div>
          </div>

          <div className="am-grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
            <section className="am-card">
              <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconChart width={16} height={16} />Shopping journey</h2>
              <p className="am-auth-subtitle">Search → Matched → Compared → Visited → Viewed → Checkout → Abandoned</p>
              {FUNNEL.map((f) => <Bar key={f.key} label={f.label} count={analytics[f.key] as number} max={maxFunnel} />)}
            </section>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <section className="am-card">
                <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconTag width={16} height={16} />Top requested criteria</h2>
                {analytics.topRequestedCriteria.length === 0 && <p className="am-help-text">No criteria recorded yet.</p>}
                {analytics.topRequestedCriteria.map((c) => <Bar key={c.criterion} label={c.criterion} count={c.count} max={maxCriteria} />)}
              </section>
              <section className="am-card">
                <h2 className="am-modal-title">Most excluded on</h2>
                {analytics.exclusions.length === 0 && <p className="am-help-text">No exclusions recorded yet.</p>}
                {analytics.exclusions.map((c) => <Bar key={c.criterion} label={c.criterion} count={c.count} max={maxExclusions} />)}
              </section>
              <section className="am-card">
                <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconGavel width={16} height={16} />Auction activity</h2>
                <div className="am-stat-grid">
                  <div className="am-stat-card"><div className="am-stat-label">Views</div><div className="am-stat-value" style={{ fontSize: 20 }}>{analytics.auctionViews}</div></div>
                  <div className="am-stat-card"><div className="am-stat-label">Bids</div><div className="am-stat-value" style={{ fontSize: 20 }}>{analytics.auctionBids}</div></div>
                  <div className="am-stat-card"><div className="am-stat-label">Buy-nows</div><div className="am-stat-value" style={{ fontSize: 20 }}>{analytics.auctionBuyNows}</div></div>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
