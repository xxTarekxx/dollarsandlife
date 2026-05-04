"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsGet } from "@/lib/cmsApi";
import CmsNav from "../CmsNav";

interface BrowseArticle {
  id: string;
  headline: string;
  authorName: string;
}

interface Group {
  collection: string;
  categorySlug: string;
  label: string;
  articles: BrowseArticle[];
}

interface Me {
  name: string;
  role: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  breaking_news:    "📰",
  budget_data:      "💰",
  freelance_jobs:   "💼",
  money_making_apps:"📱",
  remote_jobs:      "🖥️",
  start_a_blog:     "✍️",
};

export default function OtherArticlesPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([cmsGet("/me"), cmsGet("/browse-articles")])
      .then(([user, data]) => {
        setMe(user);
        setGroups(data.groups || []);
      })
      .catch(() => {
        setError("Failed to load.");
        router.push("/cms/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !me) {
    return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page-wide">

        {!selected ? (
          <>
            <div className="cms-articles-hero">
              <div>
                <div className="cms-articles-kicker">Browse Articles</div>
                <p className="cms-subheading" style={{ marginTop: "0.4rem" }}>
                  Pick a category to see published articles and propose edits.
                </p>
              </div>
            </div>

            {error && <div className="cms-error">{error}</div>}

            <div className="cms-browse-category-grid">
              {groups.map((g) => (
                <button
                  key={g.collection}
                  className="cms-browse-category-card"
                  onClick={() => setSelected(g)}
                >
                  <span className="cms-browse-category-icon">
                    {CATEGORY_ICONS[g.collection] || "📄"}
                  </span>
                  <span className="cms-browse-category-label">{g.label}</span>
                  <span className="cms-browse-category-count">
                    {g.articles.length} article{g.articles.length !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="cms-articles-hero">
              <div>
                <button
                  className="cms-browse-back"
                  onClick={() => setSelected(null)}
                >
                  ← All Categories
                </button>
                <div className="cms-articles-kicker" style={{ marginTop: "0.5rem" }}>
                  {CATEGORY_ICONS[selected.collection] || "📄"} {selected.label}
                </div>
                <p className="cms-subheading" style={{ marginTop: "0.4rem" }}>
                  {selected.articles.length} article{selected.articles.length !== 1 ? "s" : ""} — click Edit to propose a change.
                </p>
              </div>
            </div>

            {error && <div className="cms-error">{error}</div>}

            <div className="cms-articles-section">
              {selected.articles.length === 0 ? (
                <div className="cms-articles-empty">
                  <p>No articles in this section yet.</p>
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {selected.articles.map((a) => (
                    <li
                      key={a.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        padding: "0.75rem 0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#EDE9FF" }}>{a.headline}</div>
                        {a.authorName && (
                          <div style={{ fontSize: "0.8rem", color: "#928EAE", marginTop: "0.2rem" }}>
                            {a.authorName}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/cms/other-articles/${encodeURIComponent(selected.collection)}/${encodeURIComponent(a.id)}/edit`}
                        className="cms-btn cms-btn-secondary cms-btn-sm"
                        style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
