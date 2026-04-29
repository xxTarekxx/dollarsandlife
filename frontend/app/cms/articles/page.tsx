"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsGet } from "@/lib/cmsApi";
import CmsNav from "../CmsNav";

interface Article {
  id: string;
  headline: string;
  category: string;
  datePublished: string;
  image?: string;
  source?: "published" | "draft";
  status?: "published" | "pending" | "approved" | "rejected";
  reviewNote?: string;
}

interface Me {
  name: string;
  role: string;
}

export default function MyArticles() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      cmsGet("/me"),
      cmsGet("/my-articles"),
    ]).then(([user, arts]) => {
      setMe(user);
      setArticles(arts);
    }).catch(() => {
      setError("Failed to load articles.");
      router.push("/cms/login");
    })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status !== "published");
  const pendingCount = drafts.filter((a) => a.status === "pending").length;
  const approvedCount = drafts.filter((a) => a.status === "approved").length;
  const rejectedCount = drafts.filter((a) => a.status === "rejected").length;

  return (
    <>
      <CmsNav userName={me?.name} role={me?.role} />
      <div className="cms-page-wide">
        <div className="cms-articles-hero">
          <div>
            <h1 className="cms-articles-kicker" style={{ marginBottom: "0.5rem" }}>My Articles</h1>
            <p className="cms-subheading" style={{ marginBottom: 0 }}>
              Track published work, review status, and draft feedback in one place.
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
            <span className="cms-articles-stat-label">Pending</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{approvedCount}</span>
            <span className="cms-articles-stat-label">Approved</span>
          </div>
          <div className="cms-articles-stat-card">
            <span className="cms-articles-stat-value">{rejectedCount}</span>
            <span className="cms-articles-stat-label">Needs Changes</span>
          </div>
        </div>

        <div className="cms-articles-section">
          <div className="cms-card-title">Submitted Drafts</div>
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
                  <div className="cms-article-card-meta">
                    Submitted {new Date(article.datePublished).toLocaleDateString()}
                  </div>
                  {article.reviewNote && (
                    <div className="cms-article-card-note">
                      {article.reviewNote}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="cms-articles-section">
          <div className="cms-card-title">Published Articles</div>
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
                  <div className="cms-article-card-meta">
                    Published {new Date(article.datePublished).toLocaleDateString()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
