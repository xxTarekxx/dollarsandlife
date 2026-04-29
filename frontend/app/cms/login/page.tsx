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
        if (res.status === 401) {
          setError("Wrong email or password. If you just changed it, use your new password and the exact CMS email on the account.");
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }
      if (data.mustChangePassword) { router.push("/cms/change-password"); return; }
      router.push(data.role === "admin" ? "/cms/admin" : "/cms/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cms-auth-wrap">
      <div className="cms-auth-card">
        <div className="cms-auth-logo">✍️ Dollars & Life</div>
        <div className="cms-auth-sub">Contributor Portal</div>

        {error && <div className="cms-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cms-field">
            <label className="cms-label">Email</label>
            <input
              className="cms-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
            <div style={{ fontSize: "0.78rem", color: "#9a9ab0" }}>
              Use the exact CMS email tied to your account.
            </div>
          </div>
          <div className="cms-field">
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
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
