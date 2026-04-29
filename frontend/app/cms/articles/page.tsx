"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsGet } from "@/lib/cmsApi";
import CmsNav from "../CmsNav";

type MainTab = "published" | "drafts" | "myEdits";

interface Article {
  id: string;
  headline: string;
  category: string;
  collection?: string;
  datePublished: string;
  image?: string;
  source?: "published" | "draft";
  status?: "published" | "pending" | "approved" | "rejected";
  reviewNote?: string;
}

interface EditRequestRow {
  _id: string;
  collectionName: string;
  articleId: string;
  originalHeadline: string;
  proposedHeadline: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

interface Me {
  name: string;
  role: string;
}

export default function MyArticles() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [myEdits, setMyEdits] = useState<EditRequestRow[]>([]);
  const [tab, setTab] = useState<MainTab>("published");
  const [loading, setLoading] = useState(true);
  const [editsLoading, setEditsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([cmsGet("/me"), cmsGet("/my-articles")])
      .then(([user, arts]) => {
        setMe(user);
        setArticles(arts);
      })
      .catch(() => {
        setError("Failed to load articles.");
        router.push("/cms/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (tab !== "myEdits" || !me) return;
    setEditsLoading(true);
    cmsGet("/article-edit-requests?selfOnly=1")
      .then(setMyEdits)
      .catch(() => setError("Failed to load your edit requests."))
      .finally(() => setEditsLoading(false));
  }, [tab, me]);

  if (loading) {
    return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status !== "published");
  const pendingCount = drafts.filter((a) => a.status === "pending").length;
  const approvedCount = drafts.filter((a) => a.status === "approved").length;
  const rejectedCount = drafts.filter((a) => a.status === "rejected").length;
  const pendingEdits = myEdits.filter((e) => e.status === "pending").length;

  return (
    <>
      <CmsNav userName={me?.name} role={me?.role} />
      <div className="cms-page-wide">
        <div className="cms-articles-hero">
          <div>
            <h1 className="cms-articles-kicker" style={{ marginBottom: "0.5rem" }}>My Articles</h1>
            <p className="cms-subheading" style={{ marginBottom: 0 }}>
              Published work, draft submissions, and edits you proposed on your own articles.
            </p>
          </div>
          <Link href="/cms/articles/new" className="cms-btn cms-btn-primary cms-articles-add">
            + Add Article
          </Link>
        </div>

        {error && <div className="cms-error">{error}</div>}

        <div className="cms-articles-stats">
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{published.length}</span>
            <span className="cms-articles-stat-label">Published</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{pendingCount}</span>
            <span className="cms-articles-stat-label">Drafts pending</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{approvedCount}</span>
            <span className="cms-articles-stat-label">Drafts approved</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{rejectedCount}</span>
            <span className="cms-articles-stat-label">Drafts rejected</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{pendingEdits}</span>
            <span className="cms-articles-stat-label">My edits pending</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {(
            [
              ["published", "Published"],
              ["drafts", "Submitted drafts"],
              ["myEdits", "Edits to my work"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`cms-btn cms-btn-sm ${tab === key ? "cms-btn-primary" : "cms-btn-secondary"}`}
              style={{ width: "auto" }}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "drafts" && (
          <div className="cms-articles-section">
            <div className="cms-card-title">Submitted drafts</div>
            {drafts.length === 0 ? (
              <div className="cms-articles-empty">
                <p>No drafts yet.</p>
              </div>
            ) : (
              <div className="cms-articles-grid">
                {drafts.map((article) => (
                  <article key={article.id} className="cms-article-card">
                    <div className="cms-article-card-top">
                      <span className={`cms-status cms-status-${article.status}`}>{article.status}</span>
                      <span className="cms-tag">{article.category}</span>
                    </div>
                    <h2 className="cms-article-card-title">{article.headline}</h2>
                    <div className="cms-article-card-meta">Submitted {new Date(article.datePublished).toLocaleDateString()}</div>
                    {article.reviewNote && <div className="cms-article-card-note">{article.reviewNote}</div>}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "published" && (
          <div className="cms-articles-section">
            <div className="cms-card-title">Published articles</div>
            {published.length === 0 ? (
              <div className="cms-articles-empty">
                <p>No published articles yet.</p>
                <Link href="/cms/articles/new" className="cms-articles-empty-link">
                  Submit your first article
                </Link>
              </div>
            ) : (
              <div className="cms-articles-grid">
                {published.map((article) => (
                  <article key={article.id} className="cms-article-card cms-article-card-published">
                    <div className="cms-article-card-top">
                      <span className="cms-status cms-status-approved">published</span>
                      <span className="cms-tag">{article.category}</span>
                    </div>
                    <h2 className="cms-article-card-title">{article.headline}</h2>
                    <div className="cms-article-card-meta">Published {new Date(article.datePublished).toLocaleDateString()}</div>
                    <div style={{ marginTop: "0.75rem" }}>
                      <Link
                        href={`/cms/other-articles/${encodeURIComponent(article.collection || "")}/${encodeURIComponent(article.id)}/edit`}
                        className="cms-btn cms-btn-secondary cms-btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        Propose an update
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "myEdits" && (
          <div className="cms-articles-section">
            <div className="cms-card-title">Edits on articles you authored</div>
            {editsLoading && myEdits.length === 0 ? (
              <div style={{ padding: "1rem", color: "#9a9ab0" }}>Loading…</div>
            ) : myEdits.length === 0 ? (
              <div className="cms-articles-empty">
                <p>No edit requests yet. Open a published article and submit changes for review.</p>
              </div>
            ) : (
              <div className="cms-articles-grid">
                {myEdits.map((row) => (
                  <article key={row._id} className="cms-article-card">
                    <div className="cms-article-card-top">
                      <span className={`cms-status cms-status-${row.status === "approved" ? "approved" : row.status === "rejected" ? "rejected" : "pending"}`}>{row.status}</span>
                      <span className="cms-tag">{row.collectionName}</span>
                    </div>
                    <h2 className="cms-article-card-title">{row.proposedHeadline || row.originalHeadline}</h2>
                    <div className="cms-article-card-meta" style={{ fontSize: "0.8rem", color: "#6b6578" }}>
                      Was: {row.originalHeadline}
                    </div>
                    <div className="cms-article-card-meta">Submitted {new Date(row.submittedAt).toLocaleDateString()}</div>
                    {row.reviewNote && <div className="cms-article-card-note">{row.reviewNote}</div>}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
