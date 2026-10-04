"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { IconCheck, IconEye, IconEyeOff, IconLock, IconMail, IconUser, LogoMark } from "@/lib/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const { signup, status } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const emailValid = useMemo(() => EMAIL_RE.test(email), [email]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/app");
  }, [status, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms and Privacy Policy to continue.");
      return;
    }
    setBusy(true);
    try {
      const result = await signup(email, password, fullName || undefined);
      if (result.requiresEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        router.push("/app");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const ImageSide = (
    <div className="am-auth-imageside">
      <Image src="/auth/cloths.png" alt="" fill sizes="(max-width: 860px) 0px, 40vw" priority style={{ objectFit: "cover", mixBlendMode: "multiply", opacity: 0.92 }} />
    </div>
  );

  if (needsConfirmation) {
    return (
      <div className="am-auth-shell">
        <div className="am-auth-frame">
          <div className="am-auth-formside">
            <div className="am-brand" style={{ marginBottom: 32 }}><LogoMark />Agent Mall</div>
            <h1 className="am-auth-title" style={{ fontSize: 26 }}>Check your email</h1>
            <p className="am-auth-subtitle" style={{ marginBottom: 26 }}>
              We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then sign in.
            </p>
            <Link href="/login" className="am-btn am-btn-primary am-btn-block" style={{ textDecoration: "none" }}>Go to sign in</Link>
          </div>
          {ImageSide}
        </div>
      </div>
    );
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
            <Link href="/login" className="am-auth-tab">Sign In</Link>
            <span className="am-auth-tab active">Signup</span>
          </div>

          <h1 className="am-auth-title" style={{ fontSize: 26 }}>Create Account</h1>
          <p className="am-auth-subtitle" style={{ marginBottom: 22 }}>Join and start shopping with your agent.</p>

          <form onSubmit={onSubmit}>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="fullName">Full name</label>
              <div className="am-input-icon-wrap">
                <span className="am-input-icon-left"><IconUser width={16} height={16} /></span>
                <input id="fullName" className="am-input" type="text" autoComplete="name" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="email">Email address</label>
              <div className={`am-input-icon-wrap ${emailValid ? "has-toggle" : ""}`}>
                <span className="am-input-icon-left"><IconMail width={16} height={16} /></span>
                <input id="email" className="am-input" type="email" autoComplete="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
                {emailValid && <span className="am-auth-check"><IconCheck width={11} height={11} /></span>}
              </div>
            </div>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="password">Password</label>
              <div className="am-input-icon-wrap has-toggle">
                <span className="am-input-icon-left"><IconLock width={16} height={16} /></span>
                <input
                  id="password" className="am-input" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="am-input-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
              <span className="am-help-text">At least 8 characters.</span>
            </div>
            <div className="am-field">
              <label className="am-sr-only" htmlFor="confirmPassword">Confirm password</label>
              <div className="am-input-icon-wrap">
                <span className="am-input-icon-left"><IconLock width={16} height={16} /></span>
                <input
                  id="confirmPassword" className="am-input" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Confirm Password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="am-field">
              <label className="am-row" style={{ alignItems: "flex-start", gap: 8, fontWeight: 400 }}>
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required style={{ marginTop: 3 }} />
                <span className="am-help-text">I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
              </label>
            </div>

            {error && <p className="am-error-text" role="alert">{error}</p>}

            <button className="am-btn am-btn-primary am-btn-block" type="submit" disabled={busy}>
              {busy ? <span className="am-spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="am-auth-trust">
            One account, every connected store — your agent searches, compares and buys on your behalf, with every purchase waiting on your approval.
          </p>
        </div>
        {ImageSide}
      </div>
    </div>
  );
}
