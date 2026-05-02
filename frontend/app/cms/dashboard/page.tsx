"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { cmsGet, cmsPut, cmsUpload } from "@/lib/cmsApi";
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
  expertise: string[];
  achievements: string;
  social: { linkedin?: string };
}

export default function Dashboard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [bio, setBio] = useState("");
  const [achievements, setAchievements] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cmsGet("/profile").then((data: Author) => {
      setAuthor(data);
      setName(data.name || "");
      setTitle(data.title || "");
      setJoinedDate(data.joinedDate || "");
      setBio(data.bio || "");
      setAchievements(data.achievements || "");
      setLinkedin(data.social?.linkedin || "");
      setExpertise(data.expertise || []);
      setImageUrl(data.image || "");
    }).catch(() => router.push("/cms/login"));
  }, [router]);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await cmsUpload("/upload-profile-image", fd);
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
      else setError(data.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name, title, bio, achievements, linkedin, expertise };
      if (author?.role === "admin") payload.joinedDate = joinedDate;
      const res = await cmsPut("/profile", payload);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setAuthor((prev) => (prev ? { ...prev, name } : prev));
      setSuccess("Profile saved!");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!author) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <>
      <CmsNav userName={author.name} role={author.role} />
      <div className="cms-page-wide">
        <div className="cms-page-banner">
          <div>
            <h1>My Profile</h1>
            <p>Update how your public author page looks across Dollars &amp; Life.</p>
          </div>
          <button className="cms-btn" type="submit" form="cms-profile-form" disabled={saving}
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", width: "auto", backdropFilter: "blur(8px)" }}>
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
                <label className="cms-label">Title / Role <span>*</span></label>
                <input className="cms-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Personal Finance Writer" required />
              </div>
              {author.role === "admin" && (
                <div className="cms-field">
                  <label className="cms-label">Contributing Since</label>
                  <input className="cms-input" type="date" value={joinedDate} onChange={(e) => setJoinedDate(e.target.value)} />
                </div>
              )}
              <div className="cms-field">
                <label className="cms-label">Bio <span>*</span></label>
                <textarea className="cms-textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell readers about yourself..." rows={5} required />
              </div>
              <div className="cms-field">
                <label className="cms-label">Previous Achievements</label>
                <textarea className="cms-textarea" value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="e.g. Former financial advisor, MBA in Finance..." rows={4} />
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
                <input className="cms-input" type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </div>
            </div>
          </div>

          <div className="cms-dashboard-side">
            <div className="cms-card cms-dashboard-profile-card">
              <div className="cms-card-title">Profile Photo</div>
              <div className="cms-dashboard-avatar-wrap">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Profile" width={160} height={160} className="cms-dashboard-avatar" unoptimized />
                ) : (
                  <div className="cms-dashboard-avatar cms-dashboard-avatar-placeholder">Photo</div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
              />
              <button type="button" className="cms-btn cms-btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
              <p className="cms-dashboard-help">Max 5MB. JPG, PNG or WebP.</p>
            </div>

            <div className="cms-card">
              <div className="cms-card-title">Profile Preview</div>
              <div className="cms-dashboard-preview-name">{name || "Your display name"}</div>
              <div className="cms-dashboard-preview-title">{title || "Your title will appear here"}</div>
              <p className="cms-dashboard-preview-bio">{bio || "Your short public bio will appear here once you add it."}</p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
