"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/api";
import { IconCheck, IconShield } from "@/lib/icons";

interface PoliciesRow {
  merchant_id: string;
  shipping: { summary?: string; freeOverAmount?: string; estimatedDays?: string };
  returns: { summary?: string; windowDays?: string };
  warranty: { summary?: string; months?: string };
  notes: string | null;
  updated_at: string;
}

type FormState = { shippingSummary: string; freeOverAmount: string; estimatedDays: string; returnsSummary: string; windowDays: string; warrantySummary: string; months: string; notes: string };

function toForm(p: PoliciesRow): FormState {
  return {
    shippingSummary: p.shipping?.summary ?? "",
    freeOverAmount: p.shipping?.freeOverAmount ?? "",
    estimatedDays: p.shipping?.estimatedDays ?? "",
    returnsSummary: p.returns?.summary ?? "",
    windowDays: p.returns?.windowDays ?? "",
    warrantySummary: p.warranty?.summary ?? "",
    months: p.warranty?.months ?? "",
    notes: p.notes ?? "",
  };
}

export function PoliciesCard({ merchantId }: { merchantId: string }) {
  const [policies, setPolicies] = useState<PoliciesRow | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function load() {
    apiGet<PoliciesRow>(`/api/merchants/${merchantId}/policies`)
      .then((p) => { setPolicies(p); setForm(toForm(p)); })
      .catch(() => setError("Couldn't load policies."));
  }

  useEffect(load, [merchantId]);

  async function save() {
    if (!form) return;
    setBusy(true); setError(null); setSaved(false);
    try {
      const updated = await apiPatch<PoliciesRow>(`/api/merchants/${merchantId}/policies`, {
        shipping: { summary: form.shippingSummary, freeOverAmount: form.freeOverAmount, estimatedDays: form.estimatedDays },
        returns: { summary: form.returnsSummary, windowDays: form.windowDays },
        warranty: { summary: form.warrantySummary, months: form.months },
        notes: form.notes || null,
      });
      setPolicies(updated);
      setForm(toForm(updated));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save policies.");
    } finally {
      setBusy(false);
    }
  }

  if (!form) {
    return (
      <section className="am-card">
        <h2 className="am-modal-title">Policies</h2>
        <p className="am-help-text">{error ?? "Loading…"}</p>
      </section>
    );
  }

  return (
    <section className="am-card">
      <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconShield width={16} height={16} />Policies</h2>
      <p className="am-auth-subtitle">What agents tell shoppers about shipping, returns and warranty for this store. Saved to your merchant profile — not per-product.</p>

      <div className="am-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 12 }}>
        <div className="am-field" style={{ marginBottom: 0 }}>
          <label className="am-label">Shipping</label>
          <textarea className="am-textarea" rows={2} placeholder="e.g. Free over $75, ships in 1-2 business days" value={form.shippingSummary} onChange={(e) => setForm({ ...form, shippingSummary: e.target.value })} />
          <input className="am-input" placeholder="Free shipping over ($)" value={form.freeOverAmount} onChange={(e) => setForm({ ...form, freeOverAmount: e.target.value })} />
          <input className="am-input" placeholder="Estimated days" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} />
        </div>
        <div className="am-field" style={{ marginBottom: 0 }}>
          <label className="am-label">Returns</label>
          <textarea className="am-textarea" rows={2} placeholder="e.g. 30-day no-questions-asked returns" value={form.returnsSummary} onChange={(e) => setForm({ ...form, returnsSummary: e.target.value })} />
          <input className="am-input" placeholder="Return window (days)" value={form.windowDays} onChange={(e) => setForm({ ...form, windowDays: e.target.value })} />
        </div>
        <div className="am-field" style={{ marginBottom: 0 }}>
          <label className="am-label">Warranty</label>
          <textarea className="am-textarea" rows={2} placeholder="e.g. 1-year manufacturer warranty" value={form.warrantySummary} onChange={(e) => setForm({ ...form, warrantySummary: e.target.value })} />
          <input className="am-input" placeholder="Months covered" value={form.months} onChange={(e) => setForm({ ...form, months: e.target.value })} />
        </div>
      </div>

      <div className="am-field">
        <label className="am-label">Notes for shopping agents</label>
        <textarea className="am-textarea" rows={2} placeholder="Anything else an agent should tell shoppers about this store's policies" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      {error && <p className="am-error-text" role="alert">{error}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="am-btn am-btn-primary am-btn-sm" onClick={save} disabled={busy}>
          {busy ? <span className="am-spinner" /> : "Save policies"}
        </button>
        {saved && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--am-success-text)" }}><IconCheck width={14} height={14} />Saved</span>}
        {policies && policies.updated_at !== new Date(0).toISOString() && (
          <span className="am-help-text">Last updated {new Date(policies.updated_at).toLocaleString()}</span>
        )}
      </div>
    </section>
  );
}
