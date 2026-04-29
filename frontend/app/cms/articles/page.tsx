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
  source: "published" | "draft";
  status?: "pending" | "approved" | "rejected";
  reviewNote?: string;
}

interface Me {
  name: string;
  role: string;
}

export default function MyArticles() {
  const router = useRouter();
  const [me,       setMe]       = useState<Me | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([
      cmsGet("/me"),
      cmsGet("/my-articles"),
    ]).then(([user, arts]) => {
      setMe(user);
      setArticles(arts);
    }).catch(() => router.push("/cms/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;

  const published = articles.filter(a => a.source === "published");
  const drafts    = articles.filter(a => a.source === "draft");

  return (
    <>
      <CmsNav userName={me?.name} role={me?.role} />
      <div className="cms-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <h1 className="cms-heading" style={{ margin: 0 }}>My Articles</h1>
          <Link href="/cms/articles/new" className="cms-btn cms-btn-primary" style={{ textDecoration: "none" }}>
            + Add Article
          </Link>
        </div>
        <p className="cms-subheading">Your published work and submitted drafts.</p>

        {error && <div className="cms-error">{error}</div>}

        {/* Drafts */}
        {drafts.length > 0 && (
          <div className="cms-card">
            <div className="cms-card-title">Submitted Drafts</div>
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(a => (
                  <tr key={a.id}>
                    <td>{a.headline}</td>
                    <td><span className="cms-tag" style={{ margin: 0 }}>{a.category}</span></td>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(a.datePublished).toLocaleDateString()}</td>
                    <td>
                      <span className={`cms-status cms-status-${a.status}`}>{a.status}</span>
                      {a.status === "rejected" && a.reviewNote && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#9a9ab0" }}>— {a.reviewNote}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Published */}
        <div className="cms-card">
          <div className="cms-card-title">Published Articles ({published.length})</div>
          {published.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#9a9ab0" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📝</div>
              <p style={{ margin: 0 }}>No published articles yet.</p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem" }}>
                <Link href="/cms/articles/new" style={{ color: "#700877" }}>Submit your first article →</Link>
              </p>
            </div>
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Category</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {published.map(a => (
                  <tr key={a.id}>
                    <td>{a.headline}</td>
                    <td><span className="cms-tag" style={{ margin: 0 }}>{a.category}</span></td>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(a.datePublished).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
