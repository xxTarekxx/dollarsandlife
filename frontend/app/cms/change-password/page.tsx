"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { cmsPost } from "@/lib/cmsApi";

export default function ChangePassword() {
  const router = useRouter();
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("Passwords do not match"); return; }
    if (next.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res  = await cmsPost("/change-password", { currentPassword: current, newPassword: next });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to change password"); return; }
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
        <div className="cms-auth-brand-logo">🔒</div>
        <h1 className="cms-auth-brand-title">
          Set your<br />new password
        </h1>
        <p className="cms-auth-brand-desc">One-time setup required before you continue.</p>
        <ul className="cms-auth-brand-features">
          <li>Minimum 8 characters</li>
          <li>Choose something memorable</li>
          <li>You can change it anytime in settings</li>
        </ul>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="cms-auth-form-panel">
        <div className="cms-auth-card">
          <div className="cms-auth-logo">Create your password</div>
          <div className="cms-auth-sub">Enter your temporary password and choose a new one to continue.</div>

          {error && <div className="cms-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="cms-field">
              <label className="cms-label">Current (temporary) password</label>
              <input className="cms-input" type="password" value={current} onChange={e => setCurrent(e.target.value)} required autoFocus />
            </div>
            <div className="cms-field">
              <label className="cms-label">New password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="cms-input" type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Min. 8 characters" required />
            </div>
            <div className="cms-field" style={{ marginBottom: "1.5rem" }}>
              <label className="cms-label">Confirm new password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="cms-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button className="cms-btn cms-btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Set Password & Continue →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
