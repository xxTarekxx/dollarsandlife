"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { cmsGet, cmsPost, cmsUpload } from "@/lib/cmsApi";
import CmsNav from "../../CmsNav";

/* ── Types ───────────────────────────────────────────────────────────────────── */
type BlockType = "paragraph" | "heading" | "subheading" | "quote" | "list";

interface Block {
  id: string;
  type: BlockType;
  text: string;
  items?: string[]; // for list type
}

interface Me { name: string; role: string; }

const CATEGORIES = [
  "Extra Income", "Money Management", "Saving Money",
  "Investment", "Financial Freedom", "Shopping Deals",
];

const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph:  "Paragraph",
  heading:    "Heading (H2)",
  subheading: "Subheading (H3)",
  quote:      "Pull Quote",
  list:       "Bullet List",
};

function uid() { return Math.random().toString(36).slice(2); }

/* ── Component ───────────────────────────────────────────────────────────────── */
export default function NewArticle() {
  const router = useRouter();
  const imgRef = useRef<HTMLInputElement>(null);

  const [me,          setMe]          = useState<Me | null>(null);
  const [headline,    setHeadline]    = useState("");
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [metaDesc,    setMetaDesc]    = useState("");
  const [imageUrl,    setImageUrl]    = useState("");
  const [imageAlt,    setImageAlt]    = useState("");
  const [blocks,      setBlocks]      = useState<Block[]>([{ id: uid(), type: "paragraph", text: "" }]);
  const [uploading,   setUploading]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  useEffect(() => {
    cmsGet("/me").then(setMe).catch(() => router.push("/cms/login"));
  }, [router]);

  /* ── Image upload ────────────────────────────────────────────────────────── */
  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await cmsUpload("/upload-article-image", fd);
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
      else setError(data.error || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  /* ── Block helpers ───────────────────────────────────────────────────────── */
  function addBlock(type: BlockType) {
    setBlocks(p => [...p, { id: uid(), type, text: "", items: type === "list" ? [""] : undefined }]);
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks(p => p.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  function removeBlock(id: string) {
    setBlocks(p => p.filter(b => b.id !== id));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id);
      const next = [...prev];
      const swap = i + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[i], next[swap]] = [next[swap], next[i]];
      return next;
    });
  }

  function updateListItem(blockId: string, idx: number, value: string) {
    setBlocks(p => p.map(b => {
      if (b.id !== blockId || !b.items) return b;
      const items = [...b.items];
      items[idx] = value;
      return { ...b, items };
    }));
  }

  function addListItem(blockId: string) {
    setBlocks(p => p.map(b => b.id === blockId && b.items ? { ...b, items: [...b.items, ""] } : b));
  }

  function removeListItem(blockId: string, idx: number) {
    setBlocks(p => p.map(b => {
      if (b.id !== blockId || !b.items) return b;
      return { ...b, items: b.items.filter((_, i) => i !== idx) };
    }));
  }

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!imageUrl) { setError("Please upload a cover image."); return; }
    if (blocks.every(b => !b.text.trim() && !(b.items?.some(i => i.trim())))) {
      setError("Article body cannot be empty."); return;
    }

    // Build content array matching site structure
    const content = blocks.map(b => {
      if (b.type === "list") {
        return { type: "list", items: b.items?.filter(i => i.trim()) || [] };
      }
      return { type: b.type, text: b.text };
    }).filter(b => (b as { text?: string }).text?.trim() || (b as { items?: string[] }).items?.length);

    setSubmitting(true);
    try {
      const res  = await cmsPost("/submit", { headline, category, metaDescription: metaDesc, image: imageUrl, imageAlt, content });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed"); return; }
      setSuccess("Article submitted! You'll be notified when it's reviewed.");
      setTimeout(() => router.push("/cms/articles"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!me) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 860 }}>
        <h1 className="cms-heading">Submit New Article</h1>
        <p className="cms-subheading">Fill in all required fields. Your article will be reviewed before publishing.</p>

        {error   && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Meta ─────────────────────────────────────────────────────────── */}
          <div className="cms-card">
            <div className="cms-card-title">Article Details</div>

            <div className="cms-field">
              <label className="cms-label">Headline <span>*</span></label>
              <input className="cms-input" value={headline} onChange={e => setHeadline(e.target.value)}
                placeholder="Write a compelling headline…" required />
            </div>

            <div className="cms-field">
              <label className="cms-label">Category <span>*</span></label>
              <select className="cms-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="cms-field">
              <label className="cms-label">Meta Description <span>*</span></label>
              <textarea className="cms-textarea" value={metaDesc} onChange={e => setMetaDesc(e.target.value)}
                placeholder="Brief summary for search engines (150–160 characters)…" rows={2} required />
              <span style={{ fontSize: "0.72rem", color: metaDesc.length > 160 ? "#cc2244" : "#9a9ab0" }}>
                {metaDesc.length} / 160
              </span>
            </div>
          </div>

          {/* ── Cover image ──────────────────────────────────────────────────── */}
          <div className="cms-card">
            <div className="cms-card-title">Cover Image <span style={{ color: "#ff2759" }}>*</span></div>
            <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
            {imageUrl ? (
              <div>
                <Image src={imageUrl} alt={imageAlt || "Cover"} width={800} height={300}
                  className="cms-image-preview" unoptimized />
                <div className="cms-field" style={{ marginTop: "0.75rem" }}>
                  <label className="cms-label">Image Alt Text</label>
                  <input className="cms-input" value={imageAlt} onChange={e => setImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility…" />
                </div>
                <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" style={{ marginTop: "0.5rem" }}
                  onClick={() => imgRef.current?.click()} disabled={uploading}>
                  Change image
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 0", border: "2px dashed #e5e7eb", borderRadius: 10 }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🖼️</div>
                <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm"
                  onClick={() => imgRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload Cover Image"}
                </button>
                <p style={{ fontSize: "0.75rem", color: "#9a9ab0", marginTop: "0.5rem" }}>Max 5MB · JPG, PNG or WebP</p>
              </div>
            )}
          </div>

          {/* ── Content blocks ───────────────────────────────────────────────── */}
          <div className="cms-card">
            <div className="cms-card-title">Article Body <span style={{ color: "#ff2759" }}>*</span></div>

            {blocks.map((block, i) => (
              <div key={block.id} className="cms-section-block">
                <div className="cms-section-header">
                  <span className="cms-section-label">{BLOCK_LABELS[block.type]}</span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => moveBlock(block.id, -1)} disabled={i === 0}>↑</button>
                    <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => moveBlock(block.id, 1)} disabled={i === blocks.length - 1}>↓</button>
                    {blocks.length > 1 && (
                      <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => removeBlock(block.id)}>✕</button>
                    )}
                  </div>
                </div>

                {block.type === "list" ? (
                  <div>
                    {(block.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <input className="cms-input" value={item}
                          onChange={e => updateListItem(block.id, idx, e.target.value)}
                          placeholder={`Item ${idx + 1}`} />
                        {(block.items?.length ?? 0) > 1 && (
                          <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => removeListItem(block.id, idx)}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addListItem(block.id)}>+ Add item</button>
                  </div>
                ) : (
                  <textarea
                    className="cms-textarea"
                    rows={block.type === "paragraph" ? 4 : 2}
                    value={block.text}
                    onChange={e => updateBlock(block.id, { text: e.target.value })}
                    placeholder={
                      block.type === "heading"    ? "Section heading…" :
                      block.type === "subheading" ? "Subheading…" :
                      block.type === "quote"      ? "Pull quote or key takeaway…" :
                                                    "Write your paragraph here…"
                    }
                  />
                )}
              </div>
            ))}

            {/* Add block menu */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {(Object.keys(BLOCK_LABELS) as BlockType[]).map(type => (
                <button key={type} type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addBlock(type)}>
                  + {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Submit ───────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" className="cms-btn cms-btn-ghost" style={{ width: "auto" }}
              onClick={() => router.push("/cms/articles")}>
              Cancel
            </button>
            <button className="cms-btn cms-btn-primary" type="submit" disabled={submitting || uploading}>
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
