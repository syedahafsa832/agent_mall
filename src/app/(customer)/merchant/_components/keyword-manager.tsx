"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiDelete, apiGet, apiPost, ApiError } from "@/lib/api";
import { IconPlus, IconSearch, IconX } from "@/lib/icons";

interface Keyword { id: string; keyword: string; resolved_type: string | null }

export function KeywordManager({ merchantId }: { merchantId: string }) {
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ keywords: Keyword[] }>(`/api/merchants/${merchantId}/keywords`).then((r) => setKeywords(r.keywords)).catch(() => setKeywords([]));
  }, [merchantId]);

  async function addKeyword(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await apiPost<{ keyword: Keyword }>(`/api/merchants/${merchantId}/keywords`, { keyword: input.trim() });
      setKeywords((list) => [res.keyword, ...(list ?? []).filter((k) => k.keyword !== res.keyword.keyword)]);
      setInput("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that keyword.");
    } finally {
      setBusy(false);
    }
  }

  async function removeKeyword(id: string) {
    setKeywords((list) => (list ?? []).filter((k) => k.id !== id));
    try {
      await apiDelete(`/api/merchants/${merchantId}/keywords/${id}`);
    } catch {
      setError("Couldn't remove that keyword — refresh to see the current state.");
    }
  }

  return (
    <section className="am-card">
      <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconSearch width={16} height={16} />Search keywords</h2>
      <p className="am-auth-subtitle">Help agents route relevant searches to your store — update these any time.</p>

      <form onSubmit={addKeyword} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input className="am-input" placeholder="e.g. waterproof hiking boots" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="am-btn am-btn-primary am-btn-sm" type="submit" disabled={busy || !input.trim()}>
          <IconPlus width={14} height={14} />Add
        </button>
      </form>

      {error && <p className="am-error-text" role="alert">{error}</p>}

      {keywords === null && <p className="am-help-text">Loading…</p>}
      {keywords?.length === 0 && <p className="am-help-text">No keywords yet — add a few to help your store surface in relevant searches.</p>}
      {keywords && keywords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {keywords.map((k) => (
            <span key={k.id} className="am-badge am-badge-neutral" style={{ display: "inline-flex", alignItems: "center", gap: 6, textTransform: "none", fontSize: 13, padding: "6px 10px" }}>
              {k.keyword}
              <button type="button" onClick={() => removeKeyword(k.id)} aria-label={`Remove ${k.keyword}`} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: "inherit" }}>
                <IconX width={12} height={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
