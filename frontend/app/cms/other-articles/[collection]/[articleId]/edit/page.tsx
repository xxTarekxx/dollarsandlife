"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import "@components/articles-content/BlogPostContent.css";
import { cmsGet, cmsPost, cmsUpload, resolveUploadedMediaUrl } from "@/lib/cmsApi";
import CmsNav from "../../../../CmsNav";

type BlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "quote"
  | "list"
  | "authority"
  | "stats";

interface Block {
  id: string;
  type: BlockType;
  text: string;
  items?: string[];
}

interface Me {
  name: string;
  role: string;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading (H2)",
  subheading: "Subheading (H3)",
  quote: "Pull quote",
  list: "Bullet list",
  authority: "Authority links",
  stats: "Stats",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function authorityValueToText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((x) => String(x)).join("\n");
  return String(v);
}

function statsValueToText(v: unknown): string {
  return authorityValueToText(v);
}

/**
 * Normalize Mongo / API `content` into editor blocks.
 * - One array element with `{ type, text }` / `{ type, items }` → one block (preserves array order).
 * - One legacy “section” object with several fields → multiple blocks in **BlogPostContent render order**
 *   (subtitle → text → details → bullets → quotes → authorityLinks → stats), not authority/stats first.
 */
function contentToBlocks(content: unknown[]): Block[] {
  if (!Array.isArray(content) || content.length === 0) {
    return [{ id: uid(), type: "paragraph", text: "" }];
  }
  const out: Block[] = [];

  for (const raw of content as Record<string, unknown>[]) {
    const r = raw;
    const t = r.type;

    if (typeof t === "string" && ["paragraph", "heading", "subheading", "quote", "list"].includes(t)) {
      const type = t as Exclude<BlockType, "authority" | "stats">;
      if (type === "list") {
        const items = Array.isArray(r.items) ? (r.items as unknown[]).map((x) => String(x)) : [];
        out.push({ id: uid(), type: "list", text: "", items: items.length ? items : [""] });
      } else {
        out.push({ id: uid(), type, text: String(r.text || "") });
      }
      continue;
    }

    // Standalone persisted rows (from this CMS) with only authority or stats
    const hasOnlyAuthority = r.authorityLinks != null && r.stats == null && !r.subtitle && r.text == null && !r.details
      && !Array.isArray(r.bulletPoints) && !Array.isArray(r.expertQuotes);
    const hasOnlyStats = r.stats != null && r.authorityLinks == null && !r.subtitle && r.text == null && !r.details
      && !Array.isArray(r.bulletPoints) && !Array.isArray(r.expertQuotes);
    if (hasOnlyAuthority) {
      out.push({ id: uid(), type: "authority", text: authorityValueToText(r.authorityLinks) });
      continue;
    }
    if (hasOnlyStats) {
      out.push({ id: uid(), type: "stats", text: statsValueToText(r.stats) });
      continue;
    }

    if (r.subtitle) out.push({ id: uid(), type: "heading", text: String(r.subtitle) });
    if (r.text != null && String(r.text).length > 0) {
      out.push({ id: uid(), type: "paragraph", text: String(r.text) });
    }
    if (r.details != null && String(r.details).trim().length > 0) {
      out.push({ id: uid(), type: "paragraph", text: String(r.details) });
    }
    if (Array.isArray(r.bulletPoints) && r.bulletPoints.length) {
      out.push({ id: uid(), type: "list", text: "", items: (r.bulletPoints as unknown[]).map((x) => String(x)) });
    }
    if (Array.isArray(r.expertQuotes) && r.expertQuotes.length) {
      for (const q of r.expertQuotes as string[]) {
        if (String(q || "").trim()) out.push({ id: uid(), type: "quote", text: String(q) });
      }
    }
    if (r.authorityLinks != null) {
      out.push({ id: uid(), type: "authority", text: authorityValueToText(r.authorityLinks) });
    }
    if (r.stats != null) {
      out.push({ id: uid(), type: "stats", text: statsValueToText(r.stats) });
    }
  }

  return out.length ? out : [{ id: uid(), type: "paragraph", text: "" }];
}

function linesToStringOrArray(text: string): string | string[] {
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) return "";
  if (lines.length === 1) return lines[0]!;
  return lines;
}

/** Persisted shapes match public `BlogPostContent` sections (plus `{ type, text }` rows the site already stores). */
function blockToPersistedSection(b: Block): Record<string, unknown> | null {
  if (b.type === "authority") {
    const v = linesToStringOrArray(b.text);
    if (typeof v === "string" && !v.trim()) return null;
    if (Array.isArray(v) && v.length === 0) return null;
    return { authorityLinks: v };
  }
  if (b.type === "stats") {
    const v = linesToStringOrArray(b.text);
    if (typeof v === "string" && !v.trim()) return null;
    if (Array.isArray(v) && v.length === 0) return null;
    return { stats: v };
  }
  if (b.type === "list") {
    const items = b.items?.filter((i) => i.trim()) || [];
    if (!items.length) return null;
    return { type: "list", items };
  }
  return { type: b.type, text: b.text };
}

interface LiveArticleMeta {
  id: string;
  author: { name: string };
  datePublished: string;
  dateModified: string;
}

function formatArticleDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function ProposeArticleEditPage() {
  const router = useRouter();
  const params = useParams<{ collection?: string | string[]; articleId?: string | string[] }>();
  const collection = Array.isArray(params.collection) ? params.collection[0] : params.collection;
  const articleId = Array.isArray(params.articleId) ? params.articleId[0] : params.articleId;

  const imgRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [sectionLabel, setSectionLabel] = useState("");
  const [headline, setHeadline] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageFallbackUrl, setImageFallbackUrl] = useState("");
  const [liveMeta, setLiveMeta] = useState<LiveArticleMeta | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([{ id: uid(), type: "paragraph", text: "" }]);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!collection || !articleId) return;
    let cancelled = false;
    (async () => {
      try {
        const user = await cmsGet("/me");
        if (cancelled) return;
        setMe(user);
        const art = await cmsGet(
          `/published-article/${encodeURIComponent(collection)}/${encodeURIComponent(articleId)}`
        );
        if (cancelled) return;
        setSectionLabel(art.categorySlug || collection);
        setHeadline(art.headline || "");
        setMetaDesc(art.metaDescription || "");
        setImageUrl(art.image || "");
        setImageCaption(art.imageCaption ?? "");
        const pub = art.publicView as {
          id?: string;
          author?: { name: string };
          datePublished?: string;
          dateModified?: string;
          image?: { url: string };
        } | null | undefined;
        if (pub?.image?.url) setImageFallbackUrl(pub.image.url);
        else setImageFallbackUrl(art.image || "");
        setLiveMeta({
          id: pub?.id || art.articleId || articleId || "",
          author: pub?.author?.name ? pub.author : { name: art.authorName || "" },
          datePublished: pub?.datePublished || "",
          dateModified: pub?.dateModified || "",
        });
        setBlocks(contentToBlocks(art.content));
      } catch {
        if (!cancelled) router.push("/cms/login");
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collection, articleId, router]);

  const heroSrc = resolveUploadedMediaUrl((imageUrl || "").trim() || imageFallbackUrl);

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await cmsUpload("/upload-article-image", fd);
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
      else setError(data.error || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addBlock(type: BlockType) {
    setBlocks((p) => [...p, { id: uid(), type, text: "", items: type === "list" ? [""] : undefined }]);
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBlock(id: string) {
    setBlocks((p) => p.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const next = [...prev];
      const swap = i + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[i], next[swap]] = [next[swap], next[i]];
      return next;
    });
  }

  function updateListItem(blockId: string, idx: number, value: string) {
    setBlocks((p) =>
      p.map((b) => {
        if (b.id !== blockId || !b.items) return b;
        const items = [...b.items];
        items[idx] = value;
        return { ...b, items };
      })
    );
  }

  function addListItem(blockId: string) {
    setBlocks((p) => p.map((b) => (b.id === blockId && b.items ? { ...b, items: [...b.items, ""] } : b)));
  }

  function removeListItem(blockId: string, idx: number) {
    setBlocks((p) =>
      p.map((b) => {
        if (b.id !== blockId || !b.items) return b;
        return { ...b, items: b.items.filter((_, i) => i !== idx) };
      })
    );
  }

  function blockHasContent(b: Block): boolean {
    if (b.type === "list") return Boolean(b.items?.some((i) => i.trim()));
    if (b.type === "authority" || b.type === "stats") return Boolean(b.text.trim());
    return Boolean(b.text.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!collection || !articleId) return;
    if (!imageUrl.trim() && !imageFallbackUrl.trim()) {
      setError("Please set a cover image.");
      return;
    }
    if (!blocks.some(blockHasContent)) {
      setError("Article body cannot be empty.");
      return;
    }

    const content = blocks
      .map(blockToPersistedSection)
      .filter((s): s is Record<string, unknown> => s != null);

    setSubmitting(true);
    try {
      const res = await cmsPost("/article-edit-requests", {
        collection,
        articleId,
        headline,
        metaDescription: metaDesc,
        image: imageUrl.trim() || imageFallbackUrl,
        imageCaption,
        content,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }
      setSuccess("Edit submitted for review. An admin will merge it if approved.");
      setTimeout(() => router.push("/cms/articles"), 2200);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading || !me) {
    return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }

  const taBase: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "inherit",
    border: "1px dashed #c4bdd4",
    borderRadius: 6,
    padding: "0.5rem 0.65rem",
    background: "#fffefc",
  };

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 760 }}>
        <Link href="/cms/other-articles" className="cms-btn cms-btn-ghost cms-btn-sm" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
          ← Other Articles
        </Link>
        <p className="cms-subheading" style={{ marginBottom: "1rem" }}>
          Section <span className="cms-tag">{sectionLabel}</span> · Edit in place below · Live site updates only after admin approval.
        </p>

        {error && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className="blog-post-content page-container"
            style={{ maxWidth: "100%", padding: "0 0.5rem 5rem", border: "1px solid #e8e2f0", borderRadius: 10, background: "#fff" }}
          >
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              className="cms-inplace-headline"
              style={{
                ...taBase,
                fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
                fontWeight: 700,
                lineHeight: 1.25,
                marginBottom: "1rem",
                borderStyle: "solid",
              }}
              placeholder="Headline"
            />

            <div className="image-box" style={{ marginBottom: "0.75rem" }}>
              {heroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS assets may be on API origin; avoids Next/Image remote config issues
                <img
                  src={heroSrc}
                  alt={imageCaption || "Cover"}
                  className="main-image"
                  style={{ width: "auto", height: "auto", maxWidth: "100%", display: "block" }}
                />
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", border: "2px dashed #ddd", borderRadius: 8 }}>No cover image</div>
              )}
              <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => imgRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "Change cover image"}
                </button>
              </div>
            </div>

            <textarea
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              rows={2}
              placeholder="Cover caption (shown on site as image caption / alt)"
              style={{ ...taBase, marginBottom: "1rem", fontSize: "0.9rem" }}
            />

            {liveMeta && (
              <div className="author-date" style={{ marginBottom: "1rem" }}>
                <p className="author" style={{ margin: "0.25rem 0" }}>
                  By: {liveMeta.author.name}
                </p>
                <p className="published-updated-date" style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#555" }}>
                  Published: {formatArticleDate(liveMeta.datePublished)}
                  {liveMeta.dateModified ? ` | Updated: ${formatArticleDate(liveMeta.dateModified)}` : ""}
                </p>
              </div>
            )}

            <details style={{ marginBottom: "1.25rem" }}>
              <summary style={{ cursor: "pointer", fontSize: "0.88rem", color: "#5c5678" }}>Meta description (SEO)</summary>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} style={{ ...taBase, marginTop: "0.5rem" }} />
            </details>

            {blocks.map((block, i) => (
              <div key={block.id} className="content-section" style={{ marginBottom: "1.25rem", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.35rem",
                    gap: "0.35rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "#8d88a6", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {BLOCK_LABELS[block.type]}
                  </span>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => moveBlock(block.id, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => moveBlock(block.id, 1)} disabled={i === blocks.length - 1}>
                      ↓
                    </button>
                    {blocks.length > 1 && (
                      <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => removeBlock(block.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {block.type === "list" ? (
                  <div>
                    {(block.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <input className="cms-input" style={{ flex: 1 }} value={item} onChange={(e) => updateListItem(block.id, idx, e.target.value)} />
                        {(block.items?.length ?? 0) > 1 && (
                          <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => removeListItem(block.id, idx)}>
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addListItem(block.id)}>
                      + List item
                    </button>
                  </div>
                ) : block.type === "authority" ? (
                  <div className="authority-link">
                    <textarea
                      value={block.text}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      rows={5}
                      placeholder="Links or HTML (one per line)"
                      style={{ ...taBase, minHeight: "6rem" }}
                    />
                  </div>
                ) : block.type === "stats" ? (
                  <div className="stats">
                    <textarea
                      value={block.text}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      rows={4}
                      placeholder="Stats lines (one per line, or HTML)"
                      style={{ ...taBase, minHeight: "5rem" }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    rows={block.type === "paragraph" ? 6 : 3}
                    style={{
                      ...taBase,
                      fontWeight: block.type === "heading" ? 700 : block.type === "subheading" ? 600 : block.type === "quote" ? 500 : 400,
                      fontStyle: block.type === "quote" ? "italic" : "normal",
                      fontSize: block.type === "heading" ? "1.15rem" : block.type === "subheading" ? "1.05rem" : "1rem",
                    }}
                    placeholder={block.type === "paragraph" ? "Paragraph…" : "…"}
                  />
                )}
              </div>
            ))}

            <div
              style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "0.75rem 0",
                marginTop: "0.5rem",
                background: "linear-gradient(transparent, #fff 20%)",
                borderTop: "1px solid #ece8f2",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
              }}
            >
              {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                <button key={type} type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addBlock(type)}>
                  + {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button type="button" className="cms-btn cms-btn-ghost" style={{ width: "auto" }} onClick={() => router.push("/cms/other-articles")}>
              Cancel
            </button>
            <button className="cms-btn cms-btn-primary" type="submit" disabled={submitting || uploading}>
              {submitting ? "Submitting…" : "Submit edit for review"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
