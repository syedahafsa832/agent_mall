"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiPost } from "@/lib/api";
import { IconBolt, IconCloud, IconMail, IconShield, LogoMark } from "@/lib/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/auth/reset-request", { email });
    } catch {
      // Intentionally swallowed — never reveal whether this email has an account.
    } finally {
      setSent(true);
      setBusy(false);
    }
  }

  return (
    <div className="am-auth-shell">
      <div className="am-auth-grid">
        <div className="am-auth-pitch">
          <div className="am-brand">
            <LogoMark />
            Agent Mall
          </div>
          <div className="am-auth-badge"><IconMail width={14} height={14} />Reset password</div>
          <h1>Let&apos;s get you back in</h1>
          <p>Enter the email on your account and we&apos;ll send a link to reset your password.</p>

          <div className="am-feature-list">
            <div className="am-feature-row">
              <span className="am-feature-icon"><IconBolt width={18} height={18} /></span>
              <span className="am-feature-text"><b>Quick reset</b><span>One link, back in your account</span></span>
            </div>
            <div className="am-feature-row">
              <span className="am-feature-icon"><IconShield width={18} height={18} /></span>
              <span className="am-feature-text"><b>Secure by design</b><span>The link expires after use</span></span>
            </div>
          </div>
        </div>

        <div className="am-auth-card-wrap">
          <div className="am-auth-card">
            <span className="am-auth-corner-badge tr"><IconMail width={18} height={18} /></span>
            <span className="am-auth-corner-badge bl"><IconCloud width={18} height={18} /></span>

            <div className="am-auth-card-brand"><LogoMark size={18} />Agent Mall</div>

            {sent ? (
              <>
                <h2 className="am-auth-title">Check your email</h2>
                <p className="am-auth-subtitle">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                </p>
                <Link href="/login" className="am-btn am-btn-primary am-btn-block" style={{ textDecoration: "none" }}>
                  Back to sign in
                </Link>
              </>
            ) : (
              <>
                <h2 className="am-auth-title">Reset your password</h2>
                <p className="am-auth-subtitle">We&apos;ll email you a link to set a new one.</p>
                <form onSubmit={onSubmit}>
                  <div className="am-field">
                    <label className="am-sr-only" htmlFor="email">Email address</label>
                    <div className="am-input-icon-wrap">
                      <span className="am-input-icon-left"><IconMail width={15} height={15} /></span>
                      <input
                        id="email"
                        className="am-input"
                        type="email"
                        autoComplete="email"
                        placeholder="Email address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="am-btn am-btn-primary am-btn-block" type="submit" disabled={busy}>
                    {busy ? <span className="am-spinner" /> : "Send reset link"}
                  </button>
                </form>
              </>
            )}

            <p className="am-auth-switch">
              Remembered it? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
