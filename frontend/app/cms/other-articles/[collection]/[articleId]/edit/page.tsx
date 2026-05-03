"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "@components/articles-content/BlogPostContent.css";
import AutosizeTextarea from "@components/cms/AutosizeTextarea";
import { buildArticleLinkHtml, insertSnippetAtSelection } from "@/lib/articleCmsLink";
import { cmsDelete, cmsGet, cmsPost, cmsUpload, resolveUploadedMediaUrl } from "@/lib/cmsApi";
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

interface PublishedArticlePayload {
  headline?: string;
  metaDescription?: string;
  image?: string;
  coverImageAbsoluteUrl?: string;
  imageCaption?: string | null;
  categorySlug?: string;
  articleId?: string;
  authorName?: string;
  content?: unknown[];
  publicView?: {
    id?: string;
    author?: { name: string };
    datePublished?: string;
    dateModified?: string;
    image?: { url: string };
  } | null;
}

function formatArticleDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Legacy sessionStorage key — removed autosave; still cleared on load/submit/reset. */
function draftStorageKey(collection: string, articleId: string) {
  return `dnl-cms-propose:${collection}:${articleId}`;
}

function editorFingerprint(headline: string, metaDesc: string, imageUrl: string, imageCaption: string, blocks: Block[]) {
  return JSON.stringify({
    h: headline,
    m: metaDesc,
    i: imageUrl,
    c: imageCaption,
    b: blocks.map((x) => ({ type: x.type, text: x.text, items: x.items })),
  });
}

interface PublishedSnapshot {
  headline: string;
  metaDesc: string;
  image: string;
  imageCaption: string;
  blocks: Block[];
}

interface EditDraftPayload {
  headline?: string;
  metaDescription?: string;
  image?: string;
  imageCaption?: string;
  content?: unknown[];
}

export default function ProposeArticleEditPage() {
  const router = useRouter();
  const params = useParams<{ collection?: string | string[]; articleId?: string | string[] }>();
  const collection = params ? (Array.isArray(params.collection) ? params.collection[0] : params.collection) : undefined;
  const articleId = params ? (Array.isArray(params.articleId) ? params.articleId[0] : params.articleId) : undefined;

  const imgRef = useRef<HTMLInputElement>(null);
  const initialImagePathRef = useRef<string | null>(null);
  const publishedSnapshotRef = useRef<PublishedSnapshot | null>(null);
  const publishedFingerprintRef = useRef("");
  const [me, setMe] = useState<Me | null>(null);
  const [sectionLabel, setSectionLabel] = useState("");
  const [headline, setHeadline] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [serverCoverAbs, setServerCoverAbs] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageFallbackUrl, setImageFallbackUrl] = useState("");
  const [liveMeta, setLiveMeta] = useState<LiveArticleMeta | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([{ id: uid(), type: "paragraph", text: "" }]);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitNotice, setSubmitNotice] = useState<null | { kind: "success" | "error"; message: string }>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState(false);
  const [linkModal, setLinkModal] = useState<null | { blockId: string }>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkFieldError, setLinkFieldError] = useState("");
  const taRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [localCoverObjectUrl, setLocalCoverObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!collection || !articleId) return;
    let cancelled = false;
    setPageLoading(true);
    setImageUrl("");
    setImageFallbackUrl("");
    setServerCoverAbs("");
    initialImagePathRef.current = null;
    publishedSnapshotRef.current = null;
    setLocalCoverObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    (async () => {
      try {
        const [user, art, draft] = (await Promise.all([
          cmsGet("/me"),
          cmsGet(`/published-article/${encodeURIComponent(collection)}/${encodeURIComponent(articleId)}`),
          cmsPost("/article-edit-drafts/open", { collection, articleId }).then((r) => r.json()),
        ])) as [Me, PublishedArticlePayload, EditDraftPayload];
        if (cancelled) return;
        setMe(user);

        const pathFromApi = String(art.image || "");
        const snapBlocks = contentToBlocks(art.content || []);
        initialImagePathRef.current = pathFromApi;
        publishedSnapshotRef.current = {
          headline: art.headline || "",
          metaDesc: art.metaDescription || "",
          image: pathFromApi,
          imageCaption: String(art.imageCaption ?? ""),
          blocks: snapBlocks.map((b) => ({
            ...b,
            items: b.items ? [...b.items] : undefined,
          })),
        };
        publishedFingerprintRef.current = editorFingerprint(
          art.headline || "",
          art.metaDescription || "",
          pathFromApi,
          String(art.imageCaption ?? ""),
          snapBlocks
        );

        setSectionLabel(art.categorySlug || collection);
        setHeadline(String(draft?.headline ?? art.headline ?? ""));
        setMetaDesc(String(draft?.metaDescription ?? art.metaDescription ?? ""));
        setImageUrl(String(draft?.image ?? pathFromApi));
        setImageCaption(String(draft?.imageCaption ?? art.imageCaption ?? ""));
        setBlocks(contentToBlocks(draft?.content ?? art.content ?? []));

        setServerCoverAbs(String(art.coverImageAbsoluteUrl || ""));
        const pub = art.publicView;
        if (pub?.image?.url) setImageFallbackUrl(pub.image.url);
        else setImageFallbackUrl(art.image || "");
        setLiveMeta({
          id: pub?.id || art.articleId || articleId || "",
          author: pub?.author?.name ? pub.author : { name: art.authorName || "" },
          datePublished: pub?.datePublished || "",
          dateModified: pub?.dateModified || "",
        });
      } catch (err) {
        if (!cancelled) {
          const is401 = err instanceof Error && err.message.includes("401");
          if (is401) router.push("/cms/login");
          else setError("Failed to load article. Please check the URL and try again.");
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collection, articleId, router]);

  useEffect(() => {
    if (pageLoading || !collection || !articleId || deletingDraft || submitting) return;
    const t = window.setTimeout(() => {
      const content = blocks
        .map(blockToPersistedSection)
        .filter((s): s is Record<string, unknown> => s != null);
      cmsPost("/article-edit-drafts/save", {
        collection,
        articleId,
        headline,
        metaDescription: metaDesc,
        image: imageUrl,
        imageCaption,
        content,
      }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(t);
  }, [pageLoading, collection, articleId, headline, metaDesc, imageUrl, imageCaption, blocks, deletingDraft, submitting]);

  useEffect(() => {
    if (pageLoading) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const cur = editorFingerprint(headline, metaDesc, imageUrl, imageCaption, blocks);
      if (cur === publishedFingerprintRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pageLoading, headline, metaDesc, imageUrl, imageCaption, blocks]);

  useEffect(() => {
    return () => {
      if (localCoverObjectUrl) URL.revokeObjectURL(localCoverObjectUrl);
    };
  }, [localCoverObjectUrl]);

  const heroSrc = useMemo(() => {
    if (localCoverObjectUrl) return localCoverObjectUrl;
    const p = (imageUrl || "").trim();
    const abs = (serverCoverAbs || "").trim();
    const fb = (imageFallbackUrl || "").trim();
    const initial = initialImagePathRef.current;
    if (p && abs && initial !== null && p === initial) return resolveUploadedMediaUrl(abs);
    if (p) return resolveUploadedMediaUrl(p);
    if (abs) return resolveUploadedMediaUrl(abs);
    return resolveUploadedMediaUrl(fb);
  }, [localCoverObjectUrl, imageUrl, imageFallbackUrl, serverCoverAbs]);

  function resetEditorToPublishedCopy() {
    const snap = publishedSnapshotRef.current;
    if (!snap) return;
    setLocalCoverObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setHeadline(snap.headline);
    setMetaDesc(snap.metaDesc);
    setImageUrl(snap.image);
    setImageCaption(snap.imageCaption);
    setBlocks(snap.blocks.map((b) => ({ ...b, items: b.items ? [...b.items] : undefined })));
  }

  async function confirmDeleteDraftAndExit() {
    if (!collection || !articleId) return;
    setDeletingDraft(true);
    setError("");
    try {
      const imageParam = encodeURIComponent(imageUrl || "");
      await cmsDelete(`/article-edit-drafts/${encodeURIComponent(collection)}/${encodeURIComponent(articleId)}?image=${imageParam}`);
      router.push("/cms/other-articles");
    } catch {
      setError("Could not delete draft.");
      setDeletingDraft(false);
      setShowDeleteModal(false);
    }
  }

  function revertCoverOnly() {
    const snap = publishedSnapshotRef.current;
    const published = snap?.image ?? initialImagePathRef.current ?? "";
    if (localCoverObjectUrl) {
      URL.revokeObjectURL(localCoverObjectUrl);
      setLocalCoverObjectUrl(null);
    }
    setImageUrl(published);
  }

  const initialCover = (initialImagePathRef.current ?? "").trim();
  const coverDiffersFromPublished =
    Boolean(localCoverObjectUrl) || (imageUrl || "").trim() !== initialCover;

  function isEditorDirty() {
    return editorFingerprint(headline, metaDesc, imageUrl, imageCaption, blocks) !== publishedFingerprintRef.current;
  }

  function confirmLeaveIfDirty() {
    if (!isEditorDirty()) return true;
    return window.confirm("Leave this page? Unsaved changes will be lost.");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    setLocalCoverObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      const next = URL.createObjectURL(file);
      return next;
    });
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await cmsUpload("/upload-article-image-pending", fd);
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
        setLocalCoverObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } else {
        setError(data.error || "Image upload failed");
        setLocalCoverObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      }
    } catch {
      setError("Network error.");
      setLocalCoverObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
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

  function getAuthorityEntries(text: string): string[] {
    const lines = String(text || "").split("\n");
    return lines.length ? lines : [""];
  }

  function updateAuthorityEntry(blockId: string, idx: number, value: string) {
    setBlocks((p) =>
      p.map((b) => {
        if (b.id !== blockId || b.type !== "authority") return b;
        const lines = getAuthorityEntries(b.text);
        lines[idx] = value;
        return { ...b, text: lines.join("\n") };
      })
    );
  }

  function addAuthorityEntry(blockId: string) {
    setBlocks((p) =>
      p.map((b) => {
        if (b.id !== blockId || b.type !== "authority") return b;
        const lines = getAuthorityEntries(b.text);
        lines.push("");
        return { ...b, text: lines.join("\n") };
      })
    );
  }

  function removeAuthorityEntry(blockId: string, idx: number) {
    setBlocks((p) =>
      p.map((b) => {
        if (b.id !== blockId || b.type !== "authority") return b;
        const next = getAuthorityEntries(b.text).filter((_, i) => i !== idx);
        return { ...b, text: (next.length ? next : [""]).join("\n") };
      })
    );
  }

  function openLinkModal(blockId: string) {
    const ta = taRefs.current[blockId];
    let sel = "";
    if (ta && ta.selectionStart !== ta.selectionEnd) {
      sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    }
    setLinkUrl("https://");
    setLinkLabel(sel);
    setLinkFieldError("");
    setLinkModal({ blockId });
  }

  function applyLinkFromModal(e?: React.FormEvent) {
    e?.preventDefault();
    if (!linkModal) return;
    setLinkFieldError("");
    let snippet: string;
    try {
      snippet = buildArticleLinkHtml(linkUrl, linkLabel);
    } catch {
      setLinkFieldError("Enter a full URL with http:// or https://");
      return;
    }
    const { blockId } = linkModal;
    const b = blocks.find((x) => x.id === blockId);
    if (!b || b.type === "list") {
      setLinkModal(null);
      return;
    }
    const ta = taRefs.current[blockId];
    const start = ta ? ta.selectionStart : b.text.length;
    const end = ta ? ta.selectionEnd : b.text.length;
    const { next, caret } = insertSnippetAtSelection(b.text, start, end, snippet);
    updateBlock(blockId, { text: next });
    setLinkModal(null);
    requestAnimationFrame(() => {
      const t2 = taRefs.current[blockId];
      if (t2) {
        t2.focus();
        t2.setSelectionRange(caret, caret);
      }
    });
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
    setSubmitNotice(null);
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
        const msg = data.error || "Submission failed";
        setError(msg);
        setSubmitNotice({ kind: "error", message: msg });
        return;
      }
      const okMsg = data.autoApproved
        ? "Your article has been updated and is now live (auto-approved as your own article)."
        : "Request submitted. Admin can now review it in Articles > Article edits > Pending.";
      setSuccess(okMsg);
      setSubmitNotice({ kind: "success", message: okMsg });
    } catch {
      const msg = "Network error.";
      setError(msg);
      setSubmitNotice({ kind: "error", message: msg });
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
        <button
          type="button"
          className="cms-btn cms-btn-ghost cms-btn-sm"
          style={{ marginBottom: "0.75rem", display: "inline-block" }}
          onClick={() => {
            if (confirmLeaveIfDirty()) router.push("/cms/other-articles");
          }}
        >
          ← Other Articles
        </button>
        <p className="cms-subheading" style={{ marginBottom: "0.65rem" }}>
          Section <span className="cms-tag">{sectionLabel}</span> · You are editing a <strong>preview copy</strong> in this browser. Nothing on the live site or in MongoDB changes until you submit for review and an admin approves.
        </p>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#3d3558",
            background: "#f0ecfa",
            border: "1px solid #dcd4ee",
            borderRadius: 8,
            padding: "0.65rem 0.85rem",
            marginBottom: "1rem",
            lineHeight: 1.45,
          }}
        >
          Cover uploads go to a <strong>temp</strong> folder only until an admin approves. If you close or refresh the tab with unsaved edits, your browser will warn you; leaving discards those edits unless you submitted for review. Use{" "}
          <strong>Revert cover</strong> for the published image only, or <strong>Reset editor</strong> to restore the full server snapshot.
        </div>

        {error && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className="blog-post-content page-container"
            style={{ maxWidth: "100%", padding: "0 0.5rem 5rem", border: "1px solid #e8e2f0", borderRadius: 10, background: "#fff" }}
          >
            <AutosizeTextarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              minRows={1}
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

            <div className="image-box" style={{ marginBottom: "0.75rem", position: "relative" }}>
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
              <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              <button
                type="button"
                className="cms-btn cms-btn-secondary cms-btn-sm"
                aria-label="Choose a new cover image"
                onClick={() => imgRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 2,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}
              >
                {uploading ? "…" : "Edit"}
              </button>
            </div>
            <div style={{ marginTop: "-0.35rem", marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <p style={{ fontSize: "0.72rem", color: "#6b6578", margin: 0, flex: "1 1 12rem" }}>
                What you see here replaces the preview only. After you submit, an admin can approve → pending cover becomes WebP (~70%) and the <strong>target</strong> article document is updated.
              </p>
              {coverDiffersFromPublished && (
                <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" style={{ width: "auto" }} onClick={revertCoverOnly}>
                  Revert cover to published
                </button>
              )}
              <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" style={{ width: "auto" }} onClick={resetEditorToPublishedCopy}>
                Reset editor to server copy
              </button>
            </div>

            <AutosizeTextarea
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              minRows={2}
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
              <AutosizeTextarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} minRows={3} style={{ ...taBase, marginTop: "0.5rem" }} />
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

                {block.type !== "list" && block.type !== "authority" && block.type !== "heading" && (
                  <div style={{ marginBottom: "0.4rem" }}>
                    <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => openLinkModal(block.id)}>
                      Insert link…
                    </button>
                    <span style={{ fontSize: "0.72rem", color: "#8d88a6", marginLeft: "0.45rem" }}>
                      Select text first to use it as the link label (no raw HTML needed).
                    </span>
                  </div>
                )}

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
                    {getAuthorityEntries(block.text).map((entry, idx, all) => (
                      <div key={`${block.id}-auth-${idx}`} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.45rem" }}>
                        <AutosizeTextarea
                          value={entry}
                          onChange={(e) => updateAuthorityEntry(block.id, idx, e.target.value)}
                          minRows={2}
                          placeholder="Authority link or text..."
                          style={{ ...taBase, flex: 1, borderStyle: "solid", borderColor: "#c4bdd4" }}
                        />
                        {all.length > 1 && (
                          <button
                            type="button"
                            className="cms-btn cms-btn-danger cms-btn-sm"
                            onClick={() => removeAuthorityEntry(block.id, idx)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addAuthorityEntry(block.id)}>
                      + Add authority box
                    </button>
                  </div>
                ) : block.type === "stats" ? (
                  <div className="stats">
                    <AutosizeTextarea
                      ref={(el) => {
                        taRefs.current[block.id] = el;
                      }}
                      value={block.text}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      minRows={4}
                      placeholder="One entry per line"
                      style={{ ...taBase, minHeight: "5rem" }}
                    />
                  </div>
                ) : (
                  <AutosizeTextarea
                    ref={(el) => {
                      taRefs.current[block.id] = el;
                    }}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    minRows={block.type === "paragraph" ? 5 : 2}
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
              {(Object.keys(BLOCK_LABELS).filter((type) => type !== "authority") as BlockType[]).map((type) => (
                <button key={type} type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => addBlock(type)}>
                  + {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <button type="button" className="cms-btn cms-btn-danger" style={{ width: "auto" }} onClick={() => setShowDeleteModal(true)}>
                Delete
              </button>
              <button
                type="button"
                className="cms-btn cms-btn-ghost"
                style={{ width: "auto" }}
                onClick={() => {
                  if (confirmLeaveIfDirty()) router.push("/cms/other-articles");
                }}
              >
                Cancel
              </button>
            </div>
            <button className="cms-btn cms-btn-primary" style={{ width: "auto", minWidth: 240 }} type="submit" disabled={submitting || uploading}>
              {submitting ? "Submitting…" : "Submit edit for review"}
            </button>
          </div>
        </form>

        {linkModal && (
          <div
            role="presentation"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20, 12, 40, 0.45)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setLinkModal(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="cms-card"
              style={{ maxWidth: 420, width: "100%", margin: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="cms-card-title">Insert link</div>
              {linkFieldError && <div className="cms-error" style={{ marginBottom: "0.5rem" }}>{linkFieldError}</div>}
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  applyLinkFromModal(ev);
                }}
              >
                <div className="cms-field">
                  <label className="cms-label">URL</label>
                  <input className="cms-input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" required />
                </div>
                <div className="cms-field">
                  <label className="cms-label">Link text (visible)</label>
                  <input className="cms-input" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="e.g. here" />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button type="button" className="cms-btn cms-btn-ghost" style={{ width: "auto" }} onClick={() => setLinkModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="cms-btn cms-btn-primary" style={{ width: "auto" }}>
                    Insert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {submitNotice && (
          <div
            role="presentation"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20, 12, 40, 0.45)",
              zIndex: 1100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setSubmitNotice(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="cms-card"
              style={{ maxWidth: 460, width: "100%", margin: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="cms-card-title">
                {submitNotice.kind === "success" ? "Request Submitted" : "Could Not Submit"}
              </div>
              <p style={{ marginTop: 0, marginBottom: "0.9rem", lineHeight: 1.45 }}>{submitNotice.message}</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="button" className="cms-btn cms-btn-ghost" style={{ width: "auto" }} onClick={() => setSubmitNotice(null)}>
                  Close
                </button>
                {submitNotice.kind === "success" && (
                  <button
                    type="button"
                    className="cms-btn cms-btn-primary"
                    style={{ width: "auto" }}
                    onClick={() => router.push("/cms/articles?tab=myEdits")}
                  >
                    Go to My Edits
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div
            role="presentation"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20, 12, 40, 0.45)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => !deletingDraft && setShowDeleteModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="cms-card"
              style={{ maxWidth: 460, width: "100%", margin: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="cms-card-title">Delete Draft</div>
              <p style={{ marginTop: 0, marginBottom: "0.9rem", lineHeight: 1.45 }}>
                Delete these changes? This removes your temporary draft copy from the Data Base.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="cms-btn cms-btn-ghost"
                  style={{ width: "auto" }}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingDraft}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cms-btn cms-btn-danger"
                  style={{ width: "auto" }}
                  onClick={confirmDeleteDraftAndExit}
                  disabled={deletingDraft}
                >
                  {deletingDraft ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
