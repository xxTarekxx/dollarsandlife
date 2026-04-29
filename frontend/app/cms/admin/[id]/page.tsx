"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsGet, cmsPost } from "@/lib/cmsApi";
import CmsNav from "../../CmsNav";

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[];
}

interface Draft {
  _id: string;
  headline: string;
  category: string;
  metaDescription: string;
  image: string;
  content: ContentBlock[];
  authorName: string;
  authorEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewNote?: string;
}

interface Me { name: string; role: string; }

export default function ReviewDraft() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [me,      setMe]      = useState<Me | null>(null);
  const [draft,   setDraft]   = useState<Draft | null>(null);
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([cmsGet("/me"), cmsGet(`/drafts/${id}`)])
      .then(([user, d]) => {
        if (user.role !== "admin") { router.push("/cms/dashboard"); return; }
        setMe(user);
        setDraft(d);
        setNote(d.reviewNote || "");
      })
      .catch(() => router.push("/cms/admin"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function act(action: "approve" | "reject") {
    if (action === "reject" && !note.trim()) {
      setError("Please provide a reason for rejection."); return;
    }
    setError(""); setSuccess("");
    setActing(true);
    try {
      const res  = await cmsPost(`/${action}/${id}`, { reviewNote: note });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `${action} failed`); return; }
      setSuccess(action === "approve"
        ? "Article approved and published! Author notified."
        : "Article rejected. Author has been notified.");
      setTimeout(() => router.push("/cms/admin"), 2000);
    } catch {
      setError("Network error.");
    } finally {
      setActing(false);
    }
  }

  if (loading || !me) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  if (!draft)         return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Draft not found.</div>;

  const isPending = draft.status === "pending";

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 860 }}>

        {/* Back */}
        <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" style={{ marginBottom: "1rem", width: "auto" }}
          onClick={() => router.push("/cms/admin")}>
          ← Back to Admin
        </button>

        <h1 className="cms-heading">{draft.headline}</h1>
        <p className="cms-subheading">
          Submitted by <strong>{draft.authorName}</strong> ({draft.authorEmail}) · {new Date(draft.submittedAt).toLocaleString()}
          {" · "}<span className={`cms-status cms-status-${draft.status}`}>{draft.status}</span>
        </p>

        {error   && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        {/* Cover image */}
        {draft.image && (
          <div className="cms-card" style={{ padding: "1rem" }}>
            <Image src={draft.image} alt={draft.headline} width={800} height={300}
              className="cms-image-preview" unoptimized style={{ maxHeight: 260 }} />
          </div>
        )}

        {/* Meta */}
        <div className="cms-card">
          <div className="cms-card-title">Article Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem" }}>
            <div>
              <div className="cms-label" style={{ marginBottom: "0.25rem" }}>Category</div>
              <span className="cms-tag">{draft.category}</span>
            </div>
            <div>
              <div className="cms-label" style={{ marginBottom: "0.25rem" }}>Meta Description</div>
              <div style={{ color: "#5a5a72" }}>{draft.metaDescription}</div>
            </div>
          </div>
        </div>

        {/* Article body preview */}
        <div className="cms-card">
          <div className="cms-card-title">Article Body</div>
          <div style={{ fontSize: "0.925rem", lineHeight: 1.75, color: "#1a1a2e" }}>
            {draft.content.map((block, i) => {
              if (block.type === "heading")    return <h2 key={i} style={{ fontSize: "1.2rem", fontWeight: 700, margin: "1.25rem 0 0.4rem" }}>{block.text}</h2>;
              if (block.type === "subheading") return <h3 key={i} style={{ fontSize: "1rem",   fontWeight: 700, margin: "1rem 0 0.4rem" }}>{block.text}</h3>;
              if (block.type === "quote")      return <blockquote key={i} style={{ borderLeft: "3px solid #700877", paddingLeft: "1rem", margin: "1rem 0", color: "#700877", fontStyle: "italic" }}>{block.text}</blockquote>;
              if (block.type === "list")       return <ul key={i} style={{ paddingLeft: "1.5rem", margin: "0.75rem 0" }}>{block.items?.map((it, j) => <li key={j} style={{ marginBottom: "0.25rem" }}>{it}</li>)}</ul>;
              return <p key={i} style={{ marginBottom: "0.75rem" }}>{block.text}</p>;
            })}
          </div>
        </div>

        {/* Review actions */}
        {isPending && (
          <div className="cms-card">
            <div className="cms-card-title">Review Decision</div>
            <div className="cms-field">
              <label className="cms-label">Note to author <span style={{ color: "#ff2759" }}>(required for rejection)</span></label>
              <textarea className="cms-textarea" value={note} onChange={e => setNote(e.target.value)}
                placeholder="Optional feedback for the author…" rows={3} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" className="cms-btn cms-btn-danger" style={{ width: "auto" }}
                onClick={() => act("reject")} disabled={acting}>
                ✕ Reject
              </button>
              <button type="button" className="cms-btn cms-btn-primary"
                onClick={() => act("approve")} disabled={acting}>
                ✓ Approve & Publish
              </button>
            </div>
          </div>
        )}

        {!isPending && draft.reviewNote && (
          <div className="cms-card">
            <div className="cms-card-title">Review Note</div>
            <p style={{ fontSize: "0.9rem", color: "#5a5a72" }}>{draft.reviewNote}</p>
          </div>
        )}
      </div>
    </>
  );
}
