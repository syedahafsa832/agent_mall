"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { IconCompass } from "@/lib/icons";

interface VisitPackage { id: string; visit_limit: number; visits_used: number; status: string; created_at: string }
interface Tier { key: string; visits: number; price: number }

function statusTone(status: string) {
  if (status === "active") return "am-badge-success";
  if (status === "exhausted") return "am-badge-danger";
  return "am-badge-warning";
}

export function VisitPackagesCard({ merchantId }: { merchantId: string }) {
  const [packages, setPackages] = useState<VisitPackage[] | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiGet<{ packages: VisitPackage[]; tiers: Tier[] }>(`/api/merchants/${merchantId}/visit-packages`)
      .then((r) => { setPackages(r.packages); setTiers(r.tiers); })
      .catch(() => setPackages([]));
  }

  useEffect(load, [merchantId]);

  async function buy(tier: string) {
    setBusy(tier); setError(null);
    try {
      await apiPost(`/api/merchants/${merchantId}/visit-packages`, { tier });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Purchase failed.");
    } finally {
      setBusy(null);
    }
  }

  const current = packages?.[0] ?? null;

  return (
    <section className="am-card">
      <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconCompass width={16} height={16} />Unique website visits</h2>
      <p className="am-auth-subtitle">Your store is only visible to shopping agents while a visit package has room left. Charged through the platform&apos;s payment engine (mock, see Payments &amp; Accounting).</p>

      {current ? (
        <div className="am-card-flat" style={{ marginBottom: 14 }}>
          <div className="am-row-between" style={{ marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Current package</span>
            <span className={`am-badge ${statusTone(current.status)}`}>{current.status}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--am-border)", overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${Math.min((current.visits_used / current.visit_limit) * 100, 100)}%`, background: current.status === "exhausted" ? "var(--am-danger-text)" : "var(--am-accent)" }} />
          </div>
          <span className="am-help-text">{current.visits_used.toLocaleString()} / {current.visit_limit.toLocaleString()} unique visits used</span>
        </div>
      ) : packages !== null ? (
        <p className="am-help-text" style={{ marginBottom: 14 }}>No package purchased yet — your store won&apos;t appear in agent search until one is active.</p>
      ) : (
        <p className="am-help-text">Loading…</p>
      )}

      {error && <p className="am-error-text" role="alert">{error}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tiers.map((t) => (
          <button key={t.key} className="am-btn am-btn-secondary am-btn-sm" onClick={() => buy(t.key)} disabled={!!busy}>
            {busy === t.key ? <span className="am-spinner" /> : `${t.visits.toLocaleString()} visits — $${t.price}`}
          </button>
        ))}
      </div>
    </section>
  );
}
