"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import type { MerchantRow, PaymentMethodRow, ProfileRow } from "@/lib/types";
import { IconBookmark, IconCard, IconGavel, IconMapPin, IconPhone, IconPlus, IconStore, IconUser, IconX } from "@/lib/icons";

type SavedWebsite = { id: string; merchant_id: string; name: string; slug: string; domain: string; status: string; created_at: string };
type SavedAuction = { id: string; auction_id: string; title: string; status: string; starting_price: string; buy_now_price: string | null; currency: string; ends_at: string | null; merchant_name: string };
type Address = { line1?: string; city?: string; postalCode?: string; country?: string };

function initials(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[] | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  const [myWebsites, setMyWebsites] = useState<MerchantRow[] | null>(null);
  const [savedWebsites, setSavedWebsites] = useState<SavedWebsite[] | null>(null);
  const [savedAuctions, setSavedAuctions] = useState<SavedAuction[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ profile: ProfileRow | null }>("/api/profile")
      .then((res) => {
        setProfile(res.profile);
        setFullName(res.profile?.full_name ?? "");
        setPhone(res.profile?.phone ?? "");
        setAddress((res.profile?.address as Address) ?? {});
      })
      .catch(() => {});
    apiGet<{ paymentMethods: PaymentMethodRow[] }>("/api/profile/payment-methods")
      .then((res) => setPaymentMethods(res.paymentMethods))
      .catch(() => setPaymentMethods([]));
    apiGet<{ savedWebsites: SavedWebsite[] }>("/api/profile/saved-websites")
      .then((res) => setSavedWebsites(res.savedWebsites))
      .catch(() => setSavedWebsites([]));
    apiGet<{ savedAuctions: SavedAuction[] }>("/api/profile/saved-auctions")
      .then((res) => setSavedAuctions(res.savedAuctions))
      .catch(() => setSavedAuctions([]));
    apiGet<{ merchants: MerchantRow[] }>("/api/merchants")
      .then((res) => setMyWebsites(res.merchants.filter((m) => m.owner_id === user?.id)))
      .catch(() => setListError("Couldn't load your connected websites."));
  }, [user?.id]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await apiPatch<{ profile: ProfileRow }>("/api/profile", { fullName, phone, address });
      setProfile(res.profile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Couldn't save your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addCard(e: FormEvent) {
    e.preventDefault();
    setCardError(null);
    if (!/^\d{4}$/.test(cardLast4)) {
      setCardError("Enter the last 4 digits of the card.");
      return;
    }
    try {
      // Sandbox/demo only: a locally-generated reference token, never a real card
      // number — addPaymentMethod() stores this token, brand and last4, nothing else.
      const token = `sandbox_${crypto.randomUUID()}`;
      const res = await apiPost<{ paymentMethod: PaymentMethodRow }>("/api/profile/payment-methods", {
        token,
        brand: cardBrand,
        last4: cardLast4,
        expMonth: cardExpMonth ? Number(cardExpMonth) : undefined,
        expYear: cardExpYear ? Number(cardExpYear) : undefined,
        isDefault: (paymentMethods?.length ?? 0) === 0,
      });
      setPaymentMethods((list) => [res.paymentMethod, ...(list ?? [])]);
      setAddingCard(false);
      setCardLast4(""); setCardExpMonth(""); setCardExpYear("");
    } catch (err) {
      setCardError(err instanceof ApiError ? err.message : "Couldn't add this payment method.");
    }
  }

  async function removeCard(id: string) {
    setPaymentMethods((list) => (list ?? []).filter((m) => m.id !== id));
    try {
      await apiDelete(`/api/profile/payment-methods/${id}`);
    } catch {
      setListError("Couldn't remove that payment method — refresh to see the current state.");
    }
  }

  async function unsaveWebsite(id: string) {
    setSavedWebsites((list) => (list ?? []).filter((w) => w.id !== id));
    try {
      await apiDelete(`/api/profile/saved-websites/${id}`);
    } catch {
      setListError("Couldn't remove that saved website — refresh to see the current state.");
    }
  }

  async function unsaveAuction(id: string) {
    setSavedAuctions((list) => (list ?? []).filter((a) => a.id !== id));
    try {
      await apiDelete(`/api/profile/saved-auctions/${id}`);
    } catch {
      setListError("Couldn't remove that saved auction — refresh to see the current state.");
    }
  }

  return (
    <div>
      <div className="am-section-head">
        <h1>Profile</h1>
        <p>Your personal details, payment methods and connected stores.</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <span className="am-avatar">{initials(profile?.full_name ?? null, user?.email ?? null)}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.full_name || "Unnamed shopper"}</div>
          <div style={{ fontSize: 13, color: "var(--am-text-muted)" }}>{user?.email}</div>
        </div>
      </div>

      <div className="am-grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Personal information */}
          <section className="am-card">
            <h2 className="am-modal-title" style={{ marginBottom: 2 }}>Personal information</h2>
            <p className="am-auth-subtitle">Used to personalize your agent and your orders.</p>
            <form onSubmit={saveProfile}>
              <div className="am-field">
                <label className="am-label" htmlFor="fullName"><IconUser width={14} height={14} style={{ marginRight: 5, verticalAlign: -2 }} />Full name</label>
                <input id="fullName" className="am-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="am-field">
                <label className="am-label">Email</label>
                <input className="am-input" value={user?.email ?? ""} disabled />
                <span className="am-help-text">Managed via your account sign-in.</span>
              </div>
              <div className="am-field">
                <label className="am-label" htmlFor="phone"><IconPhone width={14} height={14} style={{ marginRight: 5, verticalAlign: -2 }} />Phone</label>
                <input id="phone" className="am-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="am-field">
                <label className="am-label"><IconMapPin width={14} height={14} style={{ marginRight: 5, verticalAlign: -2 }} />Address</label>
                <input className="am-input" style={{ marginBottom: 8 }} placeholder="Street address" value={address.line1 ?? ""} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input className="am-input" placeholder="City" value={address.city ?? ""} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
                  <input className="am-input" placeholder="Postal code" value={address.postalCode ?? ""} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
                </div>
                <input className="am-input" style={{ marginTop: 8 }} placeholder="Country" value={address.country ?? ""} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} />
              </div>
              {profileError && <p className="am-error-text" role="alert">{profileError}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="am-btn am-btn-primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? <span className="am-spinner" /> : "Save changes"}
                </button>
                {profileSaved && <span className="am-badge am-badge-success">Saved</span>}
              </div>
            </form>
          </section>

          {/* Payment methods */}
          <section className="am-card">
            <div className="am-row-between">
              <div>
                <h2 className="am-modal-title" style={{ marginBottom: 2 }}>Payment methods</h2>
                <p className="am-auth-subtitle" style={{ marginBottom: 0 }}>Sandbox / demo cards only — never a real card number.</p>
              </div>
              {!addingCard && (
                <button className="am-btn am-btn-secondary am-btn-sm" onClick={() => setAddingCard(true)}>
                  <IconPlus width={14} height={14} />Add card
                </button>
              )}
            </div>

            {addingCard && (
              <form onSubmit={addCard} className="am-card-flat" style={{ marginTop: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="am-field" style={{ marginBottom: 10 }}>
                    <label className="am-label">Brand</label>
                    <select className="am-select" value={cardBrand} onChange={(e) => setCardBrand(e.target.value)}>
                      <option>Visa</option><option>Mastercard</option><option>Amex</option>
                    </select>
                  </div>
                  <div className="am-field" style={{ marginBottom: 10 }}>
                    <label className="am-label">Last 4 digits</label>
                    <input className="am-input" inputMode="numeric" maxLength={4} value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ""))} placeholder="4242" />
                  </div>
                  <div className="am-field" style={{ marginBottom: 0 }}>
                    <label className="am-label">Exp. month</label>
                    <input className="am-input" inputMode="numeric" maxLength={2} value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, ""))} placeholder="12" />
                  </div>
                  <div className="am-field" style={{ marginBottom: 0 }}>
                    <label className="am-label">Exp. year</label>
                    <input className="am-input" inputMode="numeric" maxLength={4} value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, ""))} placeholder="2029" />
                  </div>
                </div>
                {cardError && <p className="am-error-text" role="alert" style={{ marginTop: 10 }}>{cardError}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="am-btn am-btn-primary am-btn-sm" type="submit">Save card</button>
                  <button className="am-btn am-btn-ghost am-btn-sm" type="button" onClick={() => setAddingCard(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div style={{ marginTop: 10 }}>
              {paymentMethods === null && <p className="am-help-text">Loading…</p>}
              {paymentMethods?.length === 0 && !addingCard && <div className="am-empty">No payment methods yet.</div>}
              {paymentMethods?.map((pm) => (
                <div className="am-list-row" key={pm.id}>
                  <span className="am-list-row-icon"><IconCard width={16} height={16} /></span>
                  <span className="am-list-row-body">
                    <span className="am-list-row-title">{pm.brand ?? "Card"} •••• {pm.last4 ?? "----"}{pm.is_default && <span className="am-badge am-badge-neutral" style={{ marginLeft: 8 }}>Default</span>}</span>
                    <span className="am-list-row-sub">{pm.exp_month && pm.exp_year ? `Expires ${String(pm.exp_month).padStart(2, "0")}/${pm.exp_year}` : "Sandbox method"}</span>
                  </span>
                  <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => removeCard(pm.id)} aria-label="Remove card"><IconX width={15} height={15} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* My websites */}
          <section className="am-card">
            <h2 className="am-modal-title" style={{ marginBottom: 2 }}>My websites</h2>
            <p className="am-auth-subtitle">Stores you own and have connected to Agent Mall.</p>
            {myWebsites === null && <p className="am-help-text">Loading…</p>}
            {myWebsites?.length === 0 && <div className="am-empty">No connected websites yet. <a href="/merchant/connect">Connect one</a>.</div>}
            {myWebsites?.map((m) => (
              <div className="am-list-row" key={m.id}>
                <span className="am-list-row-icon"><IconStore width={16} height={16} /></span>
                <span className="am-list-row-body">
                  <span className="am-list-row-title">{m.name}</span>
                  <span className="am-list-row-sub">{m.domain}</span>
                </span>
                <span className={`am-badge ${m.status === "authorized" ? "am-badge-success" : m.status === "revoked" ? "am-badge-danger" : "am-badge-warning"}`}>{m.status.replace("_", " ")}</span>
              </div>
            ))}
          </section>

          {/* Saved websites */}
          <section className="am-card">
            <h2 className="am-modal-title" style={{ marginBottom: 2 }}>Saved websites</h2>
            <p className="am-auth-subtitle">Stores you've bookmarked for later.</p>
            {savedWebsites === null && <p className="am-help-text">Loading…</p>}
            {savedWebsites?.length === 0 && <div className="am-empty">Nothing saved yet.</div>}
            {savedWebsites?.map((w) => (
              <div className="am-list-row" key={w.id}>
                <span className="am-list-row-icon"><IconBookmark width={16} height={16} /></span>
                <span className="am-list-row-body">
                  <span className="am-list-row-title">{w.name}</span>
                  <span className="am-list-row-sub">{w.domain}</span>
                </span>
                <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => unsaveWebsite(w.id)} aria-label="Remove saved website"><IconX width={15} height={15} /></button>
              </div>
            ))}
          </section>

          {/* Saved auctions */}
          <section className="am-card">
            <h2 className="am-modal-title" style={{ marginBottom: 2 }}>Saved auctions</h2>
            <p className="am-auth-subtitle">Auctions you&apos;re tracking.</p>
            {savedAuctions === null && <p className="am-help-text">Loading…</p>}
            {savedAuctions?.length === 0 && <div className="am-empty">Nothing saved yet. <a href="/app/auctions">Browse auctions</a>.</div>}
            {savedAuctions?.map((a) => (
              <div className="am-list-row" key={a.id}>
                <span className="am-list-row-icon"><IconGavel width={16} height={16} /></span>
                <span className="am-list-row-body">
                  <span className="am-list-row-title">{a.title}</span>
                  <span className="am-list-row-sub">{a.merchant_name} · {a.status}</span>
                </span>
                <a href={`/app/auctions/${a.auction_id}`} className="am-btn am-btn-ghost am-btn-sm" style={{ textDecoration: "none" }}>View</a>
                <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => unsaveAuction(a.id)} aria-label="Remove saved auction"><IconX width={15} height={15} /></button>
              </div>
            ))}
          </section>
        </div>
      </div>
      {listError && <p className="am-error-text" role="alert" style={{ marginTop: 16 }}>{listError}</p>}
    </div>
  );
}
