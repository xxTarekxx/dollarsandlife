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

export default function OtherArticlesPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
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
        <h1 className="cms-heading">Other Articles</h1>
        <p className="cms-subheading">
          Browse published articles by section and propose edits. Changes go to an admin for review before they go live.
        </p>
        {error && <div className="cms-error">{error}</div>}

        {groups.map((g) => (
          <div key={g.collection} className="cms-articles-section" style={{ marginTop: "1.5rem" }}>
            <div className="cms-card-title">{g.label}</div>
            {g.articles.length === 0 ? (
              <div className="cms-articles-empty"><p>No articles in this section.</p></div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {g.articles.map((a) => (
                  <li
                    key={a.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      padding: "0.65rem 0",
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
                        <div style={{ fontSize: "0.8rem", color: "#928EAE", marginTop: "0.2rem" }}>{a.authorName}</div>
                      )}
                    </div>
                    <Link
                      href={`/cms/other-articles/${encodeURIComponent(g.collection)}/${encodeURIComponent(a.id)}/edit`}
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
        ))}
      </div>
    </>
  );
}
