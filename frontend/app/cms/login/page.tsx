"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { cmsPost } from "@/lib/cmsApi";

export default function CmsLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res  = await cmsPost("/login", { email: normalizedEmail, password });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 401
          ? "Wrong email or password."
          : data.error || "Login failed");
        return;
      }
      if (data.mustChangePassword) { router.push("/cms/change-password"); return; }
      router.push(data.role === "admin" || data.role === "sub-admin" ? "/cms/admin" : "/cms/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cms-auth-wrap">
      {/* ── Brand panel ─────────────────────────────────────────────────── */}
      <div className="cms-auth-brand">
        <img src="/images/website-logo.webp" alt="Dollars & Life" className="cms-auth-brand-logo" />
        <h1 className="cms-auth-brand-title">
          Dollars &amp; Life<br />Contributor Portal
        </h1>
        <p className="cms-auth-brand-desc">Write. Publish. Inspire.</p>
        <ul className="cms-auth-brand-features">
          <li>Submit &amp; manage your articles</li>
          <li>Propose edits to published content</li>
          <li>Build your public author profile</li>
          <li>Track reviews &amp; feedback</li>
        </ul>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="cms-auth-form-panel">
        <div className="cms-auth-card">
          <div className="cms-auth-logo">Welcome back</div>
          <div className="cms-auth-sub">Sign in to your contributor account</div>

          {error && <div className="cms-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="cms-field">
              <label className="cms-label">Email address</label>
              <input
                className="cms-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="cms-field" style={{ marginBottom: "1.5rem" }}>
              <label className="cms-label">Password</label>
              <input
                className="cms-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="cms-btn cms-btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--subtle)", textAlign: "center", lineHeight: 1.5 }}>
            Don&apos;t have an account? Contact the site admin to get access.
          </p>
        </div>
      </div>
    </div>
  );
}
