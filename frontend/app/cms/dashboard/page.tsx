"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { cmsGet, cmsPut, cmsUpload } from "@/lib/cmsApi";
import CmsNav from "../CmsNav";

interface Author {
  name: string; email: string; role: string;
  title: string; bio: string; image: string;
  expertise: string[]; achievements: string;
  social: { linkedin?: string };
}

export default function Dashboard() {
  const router        = useRouter();
  const fileRef       = useRef<HTMLInputElement>(null);
  const [author,      setAuthor]      = useState<Author | null>(null);
  const [title,       setTitle]       = useState("");
  const [bio,         setBio]         = useState("");
  const [achievements,setAchievements]= useState("");
  const [linkedin,    setLinkedin]    = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise,   setExpertise]   = useState<string[]>([]);
  const [imageUrl,    setImageUrl]    = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  useEffect(() => {
    cmsGet("/profile").then((data: Author) => {
      setAuthor(data);
      setTitle(data.title || "");
      setBio(data.bio || "");
      setAchievements(data.achievements || "");
      setLinkedin(data.social?.linkedin || "");
      setExpertise(data.expertise || []);
      setImageUrl(data.image || "");
    }).catch(() => router.push("/cms/login"));
  }, [router]);

  function addTag() {
    const tag = expertiseInput.trim().toLowerCase();
    if (tag && !expertise.includes(tag)) setExpertise(prev => [...prev, tag]);
    setExpertiseInput("");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await cmsUpload("/upload-profile-image", fd);
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
      else setError(data.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const res = await cmsPut("/profile", { title, bio, achievements, linkedin, expertise });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed"); return; }
      setSuccess("Profile saved!");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!author) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;

  return (
    <>
      <CmsNav userName={author.name} role={author.role} />
      <div className="cms-page">
        <h1 className="cms-heading">My Profile</h1>
        <p className="cms-subheading">This information appears on your public author page.</p>

        {error   && <div className="cms-error">{error}</div>}
        {success && <div className="cms-success">{success}</div>}

        <form onSubmit={save}>
          {/* Photo */}
          <div className="cms-card">
            <div className="cms-card-title">Profile Photo</div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {imageUrl ? (
                <Image src={imageUrl} alt="Profile" width={80} height={80} className="cms-avatar-preview" unoptimized />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f3f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>👤</div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload photo"}
                </button>
                <p style={{ fontSize: "0.75rem", color: "#9a9ab0", marginTop: "0.4rem" }}>Max 5MB. JPG, PNG or WebP.</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="cms-card">
            <div className="cms-card-title">Basic Info</div>
            <div className="cms-field">
              <label className="cms-label">Display Name</label>
              <input className="cms-input" value={author.name} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="cms-field">
              <label className="cms-label">Title / Role <span>*</span></label>
              <input className="cms-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Personal Finance Writer" required />
            </div>
            <div className="cms-field">
              <label className="cms-label">Bio <span>*</span></label>
              <textarea className="cms-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell readers about yourself…" rows={4} required />
            </div>
            <div className="cms-field">
              <label className="cms-label">Previous Achievements</label>
              <textarea className="cms-textarea" value={achievements} onChange={e => setAchievements(e.target.value)} placeholder="e.g. Former financial advisor, MBA in Finance…" rows={3} />
            </div>
          </div>

          {/* Expertise */}
          <div className="cms-card">
            <div className="cms-card-title">Areas of Expertise</div>
            <div className="cms-tags">
              {expertise.map(tag => (
                <span key={tag} className="cms-tag">
                  {tag}
                  <button type="button" className="cms-tag-remove" onClick={() => setExpertise(p => p.filter(t => t !== tag))}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="cms-input" value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="e.g. budgeting, investing" />
              <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={addTag}>Add</button>
            </div>
          </div>

          {/* Social */}
          <div className="cms-card">
            <div className="cms-card-title">Social Links</div>
            <div className="cms-field">
              <label className="cms-label">LinkedIn URL</label>
              <input className="cms-input" type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
            </div>
          </div>

          <button className="cms-btn cms-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </>
  );
}
