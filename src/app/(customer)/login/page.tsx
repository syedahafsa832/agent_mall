"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { IconCheck, IconEye, IconEyeOff, IconLock, IconMail, LogoMark } from "@/lib/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = useMemo(() => EMAIL_RE.test(email), [email]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/app");
  }, [status, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="am-auth-shell">
      <div className="am-auth-frame">
        <div className="am-auth-formside">
          <div className="am-brand" style={{ marginBottom: 32 }}>
            <LogoMark />
            Agent Mall
          </div>

          <div className="am-auth-tabs">
            <span className="am-auth-tab active">Sign In</span>
            <Link href="/signup" className="am-auth-tab">Signup</Link>
          </div>

          <h1 className="am-auth-title" style={{ fontSize: 26 }}>Welcome Back</h1>
          <p className="am-auth-subtitle" style={{ marginBottom: 26 }}>Welcome back. Please enter your details.</p>

          <form onSubmit={onSubmit}>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="email">Email address</label>
              <div className={`am-input-icon-wrap ${emailValid ? "has-toggle" : ""}`}>
                <span className="am-input-icon-left"><IconMail width={16} height={16} /></span>
                <input
                  id="email"
                  className="am-input"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailValid && <span className="am-auth-check"><IconCheck width={11} height={11} /></span>}
              </div>
            </div>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="password">Password</label>
              <div className="am-input-icon-wrap has-toggle">
                <span className="am-input-icon-left"><IconLock width={16} height={16} /></span>
                <input
                  id="password"
                  className="am-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="am-input-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
            </div>

            {error && <p className="am-error-text" role="alert">{error}</p>}

            <button className="am-btn am-btn-primary am-btn-block" type="submit" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? <span className="am-spinner" /> : "Continue"}
            </button>
          </form>

          <Link href="/forgot-password" className="am-auth-forgot">Forgot your password?</Link>

          <p className="am-auth-trust">
            Join the thousands of shoppers who trust their agent to search, compare and buy — connect your stores and let it handle the rest.
          </p>
        </div>
        <div className="am-auth-imageside">
          <Image src="/auth/boxes.png" alt="" fill sizes="(max-width: 860px) 0px, 40vw" priority style={{ objectFit: "cover", mixBlendMode: "multiply", opacity: 0.92 }} />
        </div>
      </div>
    </div>
  );
}
