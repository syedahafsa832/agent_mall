"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { IconEye, IconEyeOff, IconLock, IconShield, LogoMark } from "@/lib/icons";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase redirects here with the recovery session in the URL hash
    // fragment — never sent to any server, read once on the client.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken && hash.get("type") === "recovery") {
      setTokens({ accessToken, refreshToken });
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setInvalid(true);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!tokens) return;
    setBusy(true);
    try {
      await apiPost("/api/auth/update-password", { ...tokens, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reset your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="am-auth-shell">
      <div className="am-auth-grid">
        <div className="am-auth-pitch">
          <div className="am-brand"><LogoMark />Agent Mall</div>
          <div className="am-auth-badge"><IconLock width={14} height={14} />Reset password</div>
          <h1>Choose a new password</h1>
          <p>Pick something you haven&apos;t used before. You&apos;ll be signed in everywhere else after this.</p>
        </div>

        <div className="am-auth-card-wrap">
          <div className="am-auth-card">
            <span className="am-auth-corner-badge tr"><IconShield width={18} height={18} /></span>
            <div className="am-auth-card-brand"><LogoMark size={18} />Agent Mall</div>

            {invalid ? (
              <>
                <h2 className="am-auth-title">Link expired</h2>
                <p className="am-auth-subtitle">This reset link is invalid or has already been used.</p>
                <Link href="/forgot-password" className="am-btn am-btn-primary am-btn-block" style={{ textDecoration: "none" }}>Request a new link</Link>
              </>
            ) : done ? (
              <>
                <h2 className="am-auth-title">Password updated</h2>
                <p className="am-auth-subtitle">Taking you to sign in…</p>
              </>
            ) : (
              <>
                <h2 className="am-auth-title">Set a new password</h2>
                <p className="am-auth-subtitle">At least 8 characters.</p>
                <form onSubmit={onSubmit}>
                  <div className="am-field">
                    <label className="am-sr-only" htmlFor="password">New password</label>
                    <div className="am-input-icon-wrap has-toggle">
                      <span className="am-input-icon-left"><IconLock width={15} height={15} /></span>
                      <input
                        id="password"
                        className="am-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="New password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" className="am-input-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <IconEyeOff width={15} height={15} /> : <IconEye width={15} height={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="am-field">
                    <label className="am-sr-only" htmlFor="confirmPassword">Confirm new password</label>
                    <div className="am-input-icon-wrap">
                      <span className="am-input-icon-left"><IconLock width={15} height={15} /></span>
                      <input
                        id="confirmPassword"
                        className="am-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {error && <p className="am-error-text" role="alert">{error}</p>}
                  <button className="am-btn am-btn-primary am-btn-block" type="submit" disabled={busy || !tokens}>
                    {busy ? <span className="am-spinner" /> : "Update password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
