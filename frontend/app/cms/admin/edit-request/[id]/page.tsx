"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsGet, cmsPost, resolveUploadedMediaUrl } from "@/lib/cmsApi";
import BlogPostContent from "@components/articles-content/BlogPostContent";
import CmsNav from "../../../CmsNav";

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[];
}

interface EditRequestDetail {
  _id: string;
  collectionName: string;
  articleId: string;
  originalHeadline: string;
  originalAuthorName: string;
  isOwnArticle: boolean;
  proposedEn: {
    headline: string;
    content: ContentBlock[];
    image?: string;
    imageCaption?: string;
    metaDescription?: string;
  };
  submittedByName: string;
  submittedByEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

interface Me {
  name: string;
  role: string;
}

interface BlogPostSection {
  subtitle?: string;
  text?: string;
  details?: string;
  bulletPoints?: string[];
  expertQuotes?: string[];
  authorityLinks?: string | string[];
  stats?: string | string[];
  additionalInsights?: string;
  personalTips?: string[] | string;
  conclusion?: { title: string; text: string; additionalInsights?: string };
  images?: { url: string; caption?: string }[];
  image?: string;
}

function linesToStringOrArray(text: string): string | string[] {
  const lines = String(text || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  if (lines.length === 1) return lines[0]!;
  return lines;
}

function blocksToBlogPostSections(blocks: ContentBlock[]): BlogPostSection[] {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map((b: ContentBlock & Record<string, unknown>) => {
      if (!b) return null;
      // Already in public/regular shape: preserve as-is so preview matches article renderer.
      if (
        b.authorityLinks !== undefined ||
        b.stats !== undefined ||
        b.subtitle !== undefined ||
        b.details !== undefined ||
        b.bulletPoints !== undefined ||
        b.expertQuotes !== undefined ||
        b.additionalInsights !== undefined ||
        b.personalTips !== undefined ||
        b.conclusion !== undefined ||
        b.images !== undefined ||
        b.image !== undefined
      ) {
        return b as BlogPostSection;
      }
      if (b.type === "list") {
        const items = Array.isArray(b.items) ? b.items.map((x) => String(x).trim()).filter(Boolean) : [];
        return items.length ? ({ bulletPoints: items } as BlogPostSection) : null;
      }
      if (b.type === "heading" || b.type === "subheading") {
        const text = String(b.text || "").trim();
        return text ? ({ subtitle: text } as BlogPostSection) : null;
      }
      if (b.type === "quote") {
        const text = String(b.text || "").trim();
        return text ? ({ expertQuotes: [text] } as BlogPostSection) : null;
      }
      if (b.type === "authority") {
        const v = linesToStringOrArray(String(b.text || ""));
        if (typeof v === "string" && !v) return null;
        if (Array.isArray(v) && v.length === 0) return null;
        return { authorityLinks: v };
      }
      if (b.type === "stats") {
        const v = linesToStringOrArray(String(b.text || ""));
        if (typeof v === "string" && !v) return null;
        if (Array.isArray(v) && v.length === 0) return null;
        return { stats: v };
      }
      const text = String(b.text || "").trim();
      return text ? ({ text } as BlogPostSection) : null;
    })
    .filter((x): x is BlogPostSection => Boolean(x));
}

export default function ReviewArticleEditRequest() {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [row, setRow] = useState<EditRequestDetail | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) {
      router.push("/cms/admin");
      return;
    }
    Promise.all([cmsGet("/me"), cmsGet(`/admin/article-edit-requests/${id}`)])
      .then(([user, data]) => {
        if (user.role !== "admin") {
          router.push("/cms/dashboard");
          return;
        }
        setMe(user);
        setRow(data);
        setNote(data.reviewNote || "");
      })
      .catch(() => router.push("/cms/admin"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function act(action: "approve" | "reject") {
    if (action === "reject" && !note.trim()) {
      setDecisionError("Please provide a reason for rejection.");
      return;
    }
    setDecisionError("");
    setError("");
    setSuccess("");
    setActing(true);
    try {
      const path =
        action === "approve"
          ? `/admin/article-edit-requests/${id}/approve`
          : `/admin/article-edit-requests/${id}/reject`;
      const res = await cmsPost(path, { reviewNote: note });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `${action} failed`);
        return;
      }
      setSuccess(
        action === "approve"
          ? "Changes merged into the live article. Cache flushed."
          : "Edit request rejected. Contributor notified."
      );
      setTimeout(() => router.push("/cms/admin?section=articles&queue=edits&status=pending"), 2000);
    } catch {
      setError("Network error.");
    } finally {
      setActing(false);
    }
  }

  if (loading || !me) {
    return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }
  if (!row) {
    return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Request not found.</div>;
  }

  const p = row.proposedEn;
  const isPending = row.status === "pending";
  const previewPost = {
    id: row.articleId || row._id,
    headline: p?.headline || row.originalHeadline || "",
    author: { name: row.originalAuthorName || row.submittedByName || "Author" },
    datePublished: row.submittedAt || new Date().toISOString(),
    dateModified: row.reviewedAt || undefined,
    image: {
      url: resolveUploadedMediaUrl(p?.image || ""),
      caption: p?.imageCaption || "",
    },
    content: blocksToBlogPostSections(p?.content || []),
  };

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 860 }}>
        <Link href="/cms/admin?section=articles&queue=edits" className="cms-btn cms-btn-ghost cms-btn-sm" style={{ marginBottom: "1rem", display: "inline-block" }}>
          ← Article edits
        </Link>

        <h1 className="cms-heading">{p?.headline || row.originalHeadline}</h1>
        <p className="cms-subheading">
          Proposed by <strong>{row.submittedByName}</strong> ({row.submittedByEmail}) · {new Date(row.submittedAt).toLocaleString()}
          {" · "}
          <span className={`cms-status cms-status-${row.status}`}>{row.status}</span>
          {" · "}
          <span className="cms-tag">{row.collectionName}</span> · ID {row.articleId}
        </p>

        {error && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <div className="cms-card" style={{ marginBottom: "1rem" }}>
          <div className="cms-card-title">Original headline</div>
          <p style={{ margin: 0 }}>{row.originalHeadline}</p>
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#6b6578" }}>
            Original author (name): {row.originalAuthorName || "—"}
            {row.isOwnArticle ? " · Self-edit on own article" : ""}
          </div>
        </div>

        {p?.metaDescription !== undefined && (
          <div className="cms-card">
            <div className="cms-card-title">Meta description</div>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{p.metaDescription}</p>
          </div>
        )}

        <div className="cms-card">
          <div className="cms-card-title">Proposed preview (regular article layout)</div>
          <BlogPostContent postData={previewPost} />
        </div>

        {isPending && (
          <div className="cms-card">
            <div className="cms-card-title">Decision</div>
            <div className="cms-field">
              <label className="cms-label">Note to contributor (optional on approve, required on reject)</label>
              <textarea className="cms-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {decisionError && <div className="cms-error" style={{ marginBottom: "0.75rem" }}>{decisionError}</div>}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" className="cms-btn cms-btn-primary" disabled={acting} onClick={() => act("approve")}>
                {acting ? "Working…" : "Approve & merge"}
              </button>
              <button type="button" className="cms-btn cms-btn-secondary" disabled={acting} onClick={() => act("reject")}>
                Reject
              </button>
            </div>
          </div>
        )}

        {!isPending && row.reviewNote && (
          <div className="cms-card">
            <div className="cms-card-title">Review note</div>
            <p style={{ margin: 0 }}>{row.reviewNote}</p>
          </div>
        )}
      </div>
    </>
  );
}
