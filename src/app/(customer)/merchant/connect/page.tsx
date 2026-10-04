"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { AuthorizationRow, MerchantRow } from "@/lib/types";
import {
  IconArrowRight, IconCheck, IconClock, IconCopy, IconGlobe, IconLock, IconShield, IconStore,
} from "@/lib/icons";

type Detected = { domain: string; origin: string; title: string; description: string };
// createDomainVerification() only ever returns { id, token } — not method/status —
// so the method shown below is tracked locally (verifyMethod), not read off this.
type Verification = { id: string; token: string };
type Step = "url" | "confirm" | "verify" | "authorize" | "connected";

const SCOPE_OPTIONS: { scope: string; label: string; help: string }[] = [
  { scope: "products", label: "Products", help: "Agents can read your product catalog" },
  { scope: "inventory", label: "Inventory", help: "Agents can check real-time stock" },
  { scope: "shipping", label: "Shipping", help: "Agents can read shipping options" },
  { scope: "returns", label: "Returns", help: "Agents can read your returns policy" },
  { scope: "warranty", label: "Warranty", help: "Agents can read warranty terms" },
  { scope: "checkout", label: "Purchases", help: "Agents can complete a purchase — every order still requires the shopper's approval" },
];

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "store";
}

export default function MerchantConnectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detected, setDetected] = useState<Detected | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const [merchant, setMerchant] = useState<MerchantRow | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<"dns_txt" | "well_known_file">("well_known_file");
  const [verification, setVerification] = useState<Verification | null>(null);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [scopes, setScopes] = useState<string[]>(["products", "inventory", "shipping", "returns", "warranty"]);
  const [authorization, setAuthorization] = useState<AuthorizationRow | null>(null);

  async function onDetect(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiGet<Detected & { error?: string }>(`/api/merchants/detect?url=${encodeURIComponent(url.trim())}`);
      setDetected(res);
      setName(res.title.slice(0, 80));
      setCategory("");
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach that website.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateMerchant(e: FormEvent) {
    e.preventDefault();
    if (!detected) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ merchant: MerchantRow }>("/api/merchants", {
        name: name.trim() || detected.domain,
        slug: `${slugify(name || detected.domain)}-${Math.random().toString(36).slice(2, 6)}`,
        domain: detected.domain,
        category: category.trim() || "Online store",
        connectorType: "web",
        connectorConfig: { baseUrl: detected.origin, pagePaths: [] },
      });
      setMerchant(res.merchant);
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't connect this website.");
    } finally {
      setBusy(false);
    }
  }

  async function startVerification(method: "dns_txt" | "well_known_file") {
    if (!merchant) return;
    setBusy(true);
    setError(null);
    setVerifyMethod(method);
    try {
      const res = await apiPost<{ verification: Verification }>(`/api/merchants/${merchant.id}/verification`, { method });
      setVerification(res.verification);
      setVerifyFailed(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start verification.");
    } finally {
      setBusy(false);
    }
  }

  async function checkVerification() {
    if (!merchant) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ verified: boolean; reason: string }>(`/api/merchants/${merchant.id}/verification/check`, {});
      if (res.verified) {
        setStep("authorize");
      } else {
        setVerifyFailed(true);
        setError(res.reason);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't check verification.");
    } finally {
      setBusy(false);
    }
  }

  async function onAuthorize() {
    if (!merchant || scopes.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ authorization: AuthorizationRow }>(`/api/merchants/${merchant.id}/authorization`, { scopes });
      setAuthorization(res.authorization);
      setStep("connected");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't authorize the agent.");
    } finally {
      setBusy(false);
    }
  }

  function copyToken() {
    if (!verification) return;
    navigator.clipboard?.writeText(verification.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  }

  const steps: { key: Step; label: string }[] = [
    { key: "url", label: "Website" },
    { key: "confirm", label: "Detect" },
    { key: "verify", label: "Verify" },
    { key: "authorize", label: "Permissions" },
    { key: "connected", label: "Connected" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div>
      <div className="am-section-head">
        <h1>Connect your website</h1>
        <p>Prove you own it, choose what agents can do, and shoppers&apos; agents can search and buy from it.</p>
      </div>

      <div className="am-row" style={{ gap: 6, marginBottom: 28 }}>
        {steps.map((s, i) => (
          <span key={s.key} className={`am-badge ${i === stepIndex ? "am-badge-neutral" : i < stepIndex ? "am-badge-success" : "am-badge-neutral"}`} style={{ opacity: i <= stepIndex ? 1 : 0.5 }}>
            {i < stepIndex && <IconCheck width={11} height={11} style={{ marginRight: 4, verticalAlign: -1 }} />}{s.label}
          </span>
        ))}
      </div>

      <div className="am-card" style={{ maxWidth: 560 }}>
        {step === "url" && (
          <form onSubmit={onDetect}>
            <h2 className="am-modal-title">What&apos;s your website?</h2>
            <p className="am-auth-subtitle">We&apos;ll take a quick look before you connect it.</p>
            <div className="am-field">
              <div className="am-input-icon-wrap">
                <span className="am-input-icon-left"><IconGlobe width={16} height={16} /></span>
                <input className="am-input" placeholder="https://yourstore.com" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
              </div>
            </div>
            {error && <p className="am-error-text" role="alert">{error}</p>}
            <button className="am-btn am-btn-primary" type="submit" disabled={busy || !url.trim()}>
              {busy ? <span className="am-spinner" /> : <>Detect website <IconArrowRight width={15} height={15} /></>}
            </button>
          </form>
        )}

        {step === "confirm" && detected && (
          <form onSubmit={onCreateMerchant}>
            <div className="am-list-row" style={{ padding: "0 0 16px" }}>
              <span className="am-list-row-icon"><IconStore width={16} height={16} /></span>
              <span className="am-list-row-body">
                <span className="am-list-row-title">{detected.domain}</span>
                <span className="am-list-row-sub">{detected.description || "No description found"}</span>
              </span>
            </div>
            <div className="am-field">
              <label className="am-label">Store name</label>
              <input className="am-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="am-field">
              <label className="am-label">Category</label>
              <input className="am-input" placeholder="e.g. Outdoor gear, Fashion, Electronics" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            {error && <p className="am-error-text" role="alert">{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="am-btn am-btn-primary" type="submit" disabled={busy}>
                {busy ? <span className="am-spinner" /> : <>Continue <IconArrowRight width={15} height={15} /></>}
              </button>
              <button className="am-btn am-btn-ghost" type="button" onClick={() => setStep("url")}>Back</button>
            </div>
          </form>
        )}

        {step === "verify" && merchant && (
          <div>
            <h2 className="am-modal-title">Verify you own {merchant.domain}</h2>
            <p className="am-auth-subtitle">This proves domain control — not legal ownership. Pick one method.</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button className={`am-btn am-btn-sm ${verifyMethod === "well_known_file" ? "am-btn-primary" : "am-btn-secondary"}`} onClick={() => startVerification("well_known_file")} disabled={busy}>Verification file</button>
              <button className={`am-btn am-btn-sm ${verifyMethod === "dns_txt" ? "am-btn-primary" : "am-btn-secondary"}`} onClick={() => startVerification("dns_txt")} disabled={busy}>DNS TXT record</button>
            </div>

            {verification && (
              <div className="am-card-flat" style={{ marginBottom: 16 }}>
                {verifyMethod === "well_known_file" ? (
                  <p style={{ fontSize: 13, margin: "0 0 8px" }}>
                    Publish a file at <code>/.well-known/agentic-commerce/{merchant.slug}</code> containing exactly this token:
                  </p>
                ) : (
                  <p style={{ fontSize: 13, margin: "0 0 8px" }}>
                    Add a DNS TXT record at <code>_agentic-commerce-challenge.{merchant.domain}</code> with this value:
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--am-surface)", border: "1px solid var(--am-border)", borderRadius: "var(--am-radius-sm)", padding: "8px 10px" }}>
                  <code style={{ flex: 1, fontSize: 12.5, wordBreak: "break-all" }}>{verification.token}</code>
                  <button type="button" className="am-btn am-btn-ghost am-btn-sm" onClick={copyToken} aria-label="Copy token">
                    {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                  </button>
                </div>
              </div>
            )}

            {verifyFailed && <p className="am-error-text" role="alert">We couldn&apos;t find the token yet. Publish it, then check again.</p>}
            {error && !verifyFailed && <p className="am-error-text" role="alert">{error}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="am-btn am-btn-primary" onClick={checkVerification} disabled={busy || !verification}>
                {busy ? <span className="am-spinner" /> : <><IconClock width={15} height={15} />Check now</>}
              </button>
              <button className="am-btn am-btn-ghost" onClick={() => setStep("confirm")}>Back</button>
            </div>
          </div>
        )}

        {step === "authorize" && merchant && (
          <div>
            <h2 className="am-modal-title">Choose agent permissions</h2>
            <p className="am-auth-subtitle">What can shopping agents do on {merchant.name}?</p>
            {SCOPE_OPTIONS.map((opt) => {
              const on = scopes.includes(opt.scope);
              return (
                <div className="am-list-row" key={opt.scope}>
                  <span className="am-list-row-icon"><IconShield width={16} height={16} /></span>
                  <span className="am-list-row-body">
                    <span className="am-list-row-title">{opt.label}</span>
                    <span className="am-list-row-sub">{opt.help}</span>
                  </span>
                  <button
                    type="button"
                    className={`am-switch ${on ? "on" : ""}`}
                    role="switch"
                    aria-checked={on}
                    aria-label={opt.label}
                    onClick={() => setScopes((s) => (on ? s.filter((x) => x !== opt.scope) : [...s, opt.scope]))}
                  />
                </div>
              );
            })}
            {error && <p className="am-error-text" role="alert" style={{ marginTop: 12 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="am-btn am-btn-primary" onClick={onAuthorize} disabled={busy || scopes.length === 0}>
                {busy ? <span className="am-spinner" /> : <>Authorize <IconArrowRight width={15} height={15} /></>}
              </button>
            </div>
          </div>
        )}

        {step === "connected" && merchant && (
          <div>
            <div className="am-list-row" style={{ padding: "0 0 16px" }}>
              <span className="am-list-row-icon" style={{ background: "#e4f6ea", color: "var(--am-success-text)" }}><IconCheck width={18} height={18} /></span>
              <span className="am-list-row-body">
                <span className="am-list-row-title">{merchant.name} is connected</span>
                <span className="am-list-row-sub">{merchant.domain} · {authorization?.scopes.length ?? 0} permissions granted</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/merchant?id=${merchant.id}`} className="am-btn am-btn-primary" style={{ textDecoration: "none" }}>
                Open merchant dashboard <IconArrowRight width={15} height={15} />
              </Link>
              <button className="am-btn am-btn-ghost" onClick={() => router.push("/app")}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
