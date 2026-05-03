"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  cmsGet,
  cmsPut,
  cmsUpload,
  resolveUploadedMediaUrlWithVersion,
} from "@/lib/cmsApi";
import { FORUM_TAGS } from "../../../src/data/forumTags";
import tagColors from "../../../src/utils/tagColors";
import CmsNav from "../CmsNav";

interface Author {
  name: string;
  email: string;
  role: string;
  joinedDate?: string;
  title: string;
  bio: string;
  image: string;
  imageUpdatedAt?: string;
  expertise: string[];
  achievements: string;
  social: { linkedin?: string };
}

interface CropState {
  file: File;
  objectUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  naturalWidth: number;
  naturalHeight: number;
}

const CROP_FRAME_SIZE = 280;
const OUTPUT_SIZE = 1000;

function getCropMetrics(crop: CropState) {
  const naturalWidth = crop.naturalWidth || CROP_FRAME_SIZE;
  const naturalHeight = crop.naturalHeight || CROP_FRAME_SIZE;
  const baseScale = Math.max(CROP_FRAME_SIZE / naturalWidth, CROP_FRAME_SIZE / naturalHeight);
  const scale = baseScale * crop.zoom;
  const displayWidth = naturalWidth * scale;
  const displayHeight = naturalHeight * scale;
  const maxPanX = Math.max(0, (displayWidth - CROP_FRAME_SIZE) / 2);
  const maxPanY = Math.max(0, (displayHeight - CROP_FRAME_SIZE) / 2);
  return { scale, displayWidth, displayHeight, maxPanX, maxPanY };
}

function clampCropOffsets(crop: CropState, offsetX: number, offsetY: number) {
  const { maxPanX, maxPanY } = getCropMetrics(crop);
  return {
    offsetX: Math.max(-maxPanX, Math.min(maxPanX, offsetX)),
    offsetY: Math.max(-maxPanY, Math.min(maxPanY, offsetY)),
  };
}

async function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

async function createCroppedAvatarFile(crop: CropState) {
  const image = await loadImageElement(crop.objectUrl);
  const { scale, displayWidth, displayHeight } = getCropMetrics(crop);
  const left = (CROP_FRAME_SIZE - displayWidth) / 2 + crop.offsetX;
  const top = (CROP_FRAME_SIZE - displayHeight) / 2 + crop.offsetY;
  const srcX = Math.max(0, (0 - left) / scale);
  const srcY = Math.max(0, (0 - top) / scale);
  const srcW = Math.min(image.naturalWidth - srcX, CROP_FRAME_SIZE / scale);
  const srcH = Math.min(image.naturalHeight - srcY, CROP_FRAME_SIZE / scale);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create image canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Failed to export cropped image"));
    }, "image/webp", 0.88);
  });

  return new File([blob], "author-profile.webp", { type: "image/webp" });
}

export default function Dashboard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<null | {
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>(null);

  const [author, setAuthor] = useState<Author | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [bio, setBio] = useState("");
  const [achievements, setAchievements] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUpdatedAt, setImageUpdatedAt] = useState("");
  const [crop, setCrop] = useState<CropState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cmsGet("/profile")
      .then((data: Author) => {
        setAuthor(data);
        setName(data.name || "");
        setTitle(data.title || "");
        setJoinedDate(data.joinedDate || "");
        setBio(data.bio || "");
        setAchievements(data.achievements || "");
        setLinkedin(data.social?.linkedin || "");
        setExpertise(data.expertise || []);
        setImageUrl(data.image || "");
        setImageUpdatedAt(data.imageUpdatedAt || "");
      })
      .catch(() => router.push("/cms/login"));
  }, [router]);

  useEffect(() => {
    return () => {
      if (crop?.objectUrl) URL.revokeObjectURL(crop.objectUrl);
    };
  }, [crop?.objectUrl]);

  const displayImageUrl = useMemo(
    () => (imageUrl ? resolveUploadedMediaUrlWithVersion(imageUrl, imageUpdatedAt) : ""),
    [imageUrl, imageUpdatedAt]
  );

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await cmsUpload("/upload-profile-image", fd);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      const nextUpdatedAt = data.imageUpdatedAt || new Date().toISOString();
      setImageUrl(data.url);
      setImageUpdatedAt(nextUpdatedAt);
      setAuthor((prev) =>
        prev ? { ...prev, image: data.url, imageUpdatedAt: nextUpdatedAt } : prev
      );
      setSuccess("Photo updated. Your public author image should refresh right away.");
    } finally {
      setUploading(false);
    }
  }

  function openCropper(file: File) {
    setError("");
    setSuccess("");
    if (crop?.objectUrl) URL.revokeObjectURL(crop.objectUrl);
    setCrop({
      file,
      objectUrl: URL.createObjectURL(file),
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      naturalWidth: 0,
      naturalHeight: 0,
    });
  }

  async function confirmCropAndUpload() {
    if (!crop) return;
    try {
      const croppedFile = await createCroppedAvatarFile(crop);
      await uploadImage(croppedFile);
      URL.revokeObjectURL(crop.objectUrl);
      setCrop(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image crop failed");
    }
  }

  function closeCropper() {
    if (uploading || !crop) return;
    URL.revokeObjectURL(crop.objectUrl);
    setCrop(null);
  }

  function handleCropZoom(nextZoom: number) {
    setCrop((prev) => {
      if (!prev) return prev;
      const next = { ...prev, zoom: nextZoom };
      return { ...next, ...clampCropOffsets(next, prev.offsetX, prev.offsetY) };
    });
  }

  function handleCropPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!crop) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: crop.offsetX,
      startOffsetY: crop.offsetY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleCropPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!crop || !dragRef.current) return;
    const draft = dragRef.current;
    const nextOffsetX = draft.startOffsetX + (e.clientX - draft.startX);
    const nextOffsetY = draft.startOffsetY + (e.clientY - draft.startY);
    setCrop((prev) => {
      if (!prev) return prev;
      return { ...prev, ...clampCropOffsets(prev, nextOffsetX, nextOffsetY) };
    });
  }

  function handleCropPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name,
        title,
        bio,
        achievements,
        linkedin,
        expertise,
      };
      if (author?.role === "admin") payload.joinedDate = joinedDate;

      const res = await cmsPut("/profile", payload);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }

      setAuthor((prev) =>
        prev
          ? {
              ...prev,
              name,
              title,
              bio,
              achievements,
              expertise,
              joinedDate,
              social: { ...prev.social, linkedin },
            }
          : prev
      );
      setSuccess("Profile saved. Public author pages were cache-cleared.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!author) {
    return (
      <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  const cropMetrics = crop ? getCropMetrics(crop) : null;

  return (
    <>
      <CmsNav userName={author.name} role={author.role} />
      <div className="cms-page-wide">
        <div className="cms-page-banner">
          <div>
            <h1>My Profile</h1>
            <p>Update how your public author page looks across Dollars &amp; Life.</p>
          </div>
          <button
            className="cms-btn"
            type="submit"
            form="cms-profile-form"
            disabled={saving}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              width: "auto",
              backdropFilter: "blur(8px)",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {error && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <form id="cms-profile-form" onSubmit={save} className="cms-dashboard-grid">
          <div className="cms-dashboard-main">
            <div className="cms-card">
              <div className="cms-card-title">Basic Info</div>
              <div className="cms-field">
                <label className="cms-label">Display Name</label>
                <input className="cms-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="cms-field">
                <label className="cms-label">
                  Title / Role <span>*</span>
                </label>
                <input
                  className="cms-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Personal Finance Writer"
                  required
                />
              </div>
              {author.role === "admin" && (
                <div className="cms-field">
                  <label className="cms-label">Contributing Since</label>
                  <input
                    className="cms-input"
                    type="date"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                  />
                </div>
              )}
              <div className="cms-field">
                <label className="cms-label">
                  Bio <span>*</span>
                </label>
                <textarea
                  className="cms-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself..."
                  rows={5}
                  required
                />
              </div>
              <div className="cms-field">
                <label className="cms-label">Previous Achievements</label>
                <textarea
                  className="cms-textarea"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="e.g. Former financial advisor, MBA in Finance..."
                  rows={4}
                />
              </div>
            </div>

            <div className="cms-card">
              <div className="cms-card-title">Areas of Expertise</div>
              <div className="cms-tags" style={{ marginBottom: "0.6rem" }}>
                {FORUM_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="cms-tag"
                    onClick={() => {
                      if (expertise.includes(tag)) {
                        setExpertise((p) => p.filter((t) => t !== tag));
                      } else {
                        setExpertise((p) => [...p, tag]);
                      }
                    }}
                    style={{
                      background: expertise.includes(tag) ? (tagColors[tag]?.bg || "#f2e7f8") : undefined,
                      color: expertise.includes(tag) ? (tagColors[tag]?.text || "#fff") : undefined,
                      border: expertise.includes(tag) ? "1px solid transparent" : undefined,
                      cursor: "pointer",
                      opacity: expertise.includes(tag) ? 1 : 0.9,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="cms-card">
              <div className="cms-card-title">Social Links</div>
              <div className="cms-field" style={{ marginBottom: 0 }}>
                <label className="cms-label">LinkedIn URL</label>
                <input
                  className="cms-input"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
            </div>
          </div>

          <div className="cms-dashboard-side">
            <div className="cms-card cms-dashboard-profile-card">
              <div className="cms-card-title">Profile Photo</div>
              <div className="cms-dashboard-avatar-wrap">
                {displayImageUrl ? (
                  <Image
                    src={displayImageUrl}
                    alt="Profile"
                    width={160}
                    height={160}
                    className="cms-dashboard-avatar"
                    unoptimized
                  />
                ) : (
                  <div className="cms-dashboard-avatar cms-dashboard-avatar-placeholder">Photo</div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const nextFile = e.target.files?.[0];
                  if (nextFile) openCropper(nextFile);
                  e.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                className="cms-btn cms-btn-secondary"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
              <p className="cms-dashboard-help">
                Crop to a square, zoom if needed, then upload. Saved as WebP.
              </p>
            </div>

            <div className="cms-card">
              <div className="cms-card-title">Profile Preview</div>
              <div className="cms-dashboard-preview-name">{name || "Your display name"}</div>
              <div className="cms-dashboard-preview-title">{title || "Your title will appear here"}</div>
              <p className="cms-dashboard-preview-bio">
                {bio || "Your short public bio will appear here once you add it."}
              </p>
            </div>
          </div>
        </form>
      </div>

      {crop && (
        <div className="cms-modal-backdrop" onClick={closeCropper}>
          <div
            className="cms-modal cms-cropper-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Crop profile photo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cms-cropper-header">
              <div>
                <h2 className="cms-cropper-title">Crop Profile Photo</h2>
                <p className="cms-cropper-subtitle">Drag to reposition, then zoom in or out.</p>
              </div>
            </div>

            <div className="cms-cropper-stage">
              <div
                className="cms-cropper-frame"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
              >
                <img
                  src={crop.objectUrl}
                  alt="Crop preview"
                  className="cms-cropper-image"
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setCrop((prev) => {
                      if (!prev) return prev;
                      const next = {
                        ...prev,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                      };
                      return { ...next, ...clampCropOffsets(next, prev.offsetX, prev.offsetY) };
                    });
                  }}
                  style={
                    cropMetrics
                      ? {
                          width: `${cropMetrics.displayWidth}px`,
                          height: `${cropMetrics.displayHeight}px`,
                          transform: `translate(${crop.offsetX}px, ${crop.offsetY}px)`,
                        }
                      : undefined
                  }
                />
              </div>

              <div className="cms-cropper-controls">
                <label className="cms-label" htmlFor="cms-crop-zoom">
                  Zoom
                </label>
                <input
                  id="cms-crop-zoom"
                  className="cms-cropper-zoom"
                  type="range"
                  min="1"
                  max="2.6"
                  step="0.01"
                  value={crop.zoom}
                  onChange={(e) => handleCropZoom(Number(e.target.value))}
                />
                <div className="cms-cropper-zoom-value">{Math.round(crop.zoom * 100)}%</div>
              </div>
            </div>

            <div className="cms-cropper-actions">
              <button
                type="button"
                className="cms-btn cms-btn-ghost"
                style={{ width: "auto" }}
                onClick={closeCropper}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cms-btn"
                style={{ width: "auto" }}
                onClick={confirmCropAndUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
