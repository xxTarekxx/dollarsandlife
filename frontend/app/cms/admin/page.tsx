"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsDelete, cmsGet, cmsPost, cmsPut } from "@/lib/cmsApi";
import CmsNav from "../CmsNav";

interface Draft {
  _id: string;
  headline: string;
  category: string;
  authorName: string;
  authorEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewNote?: string;
}

interface Contributor {
  _id: string;
  name: string;
  email: string;
  role: string;
  joinedDate?: string;
  disabled?: boolean;
  active?: boolean;
  mustChangePassword?: boolean;
}

interface PublicAuthor extends Contributor {
  slug?: string;
  title?: string;
  bio?: string;
  image?: string;
  expertise?: string[];
  achievements?: string;
  social?: { linkedin?: string };
  editedCount?: number;
}

interface Me {
  name: string;
  role: string;
  email: string;
}

const STATUS_TABS = ["pending", "approved", "rejected"] as const;

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const sectionParam = searchParams?.get("section");
  const statusParam = searchParams?.get("status");
  const authorId = searchParams?.get("authorId") || "";
  const section = sectionParam === "contributors" || sectionParam === "authors" ? sectionParam : "articles";
  const tab = statusParam === "approved" || statusParam === "rejected" ? statusParam : "pending";
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [authors, setAuthors] = useState<PublicAuthor[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<PublicAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [error, setError] = useState("");

  function setAdminView(
    nextSection: "articles" | "contributors" | "authors",
    nextTab?: "pending" | "approved" | "rejected",
    nextAuthorId?: string
  ) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("section", nextSection);
    if (nextSection === "articles") {
      params.set("status", nextTab || tab);
      params.delete("authorId");
    } else if (nextSection === "authors") {
      if (nextAuthorId) params.set("authorId", nextAuthorId);
      else params.delete("authorId");
      params.delete("status");
    } else {
      params.delete("status");
      params.delete("authorId");
    }
    router.replace(`/cms/admin?${params.toString()}`);
  }

  useEffect(() => {
    cmsGet("/me").then((user) => {
      if (user.role !== "admin") {
        router.push("/cms/dashboard");
        return;
      }
      setMe(user);
    }).catch(() => router.push("/cms/login"));
  }, [router]);

  useEffect(() => {
    if (!me || section !== "articles") return;
    setLoading(true);
    setError("");
    cmsGet(`/drafts?status=${tab}`)
      .then(setDrafts)
      .catch(() => setError("Failed to load drafts"))
      .finally(() => setLoading(false));
  }, [me, tab, section]);

  async function loadContributors() {
    setContributorsLoading(true);
    setError("");
    try {
      const data = await cmsGet("/authors-list");
      setContributors(data);
    } catch {
      setError("Failed to load contributors");
    } finally {
      setContributorsLoading(false);
    }
  }

  useEffect(() => {
    if (!me || section !== "contributors") return;
    loadContributors();
  }, [me, section]);

  async function loadAuthors() {
    setAuthorsLoading(true);
    setError("");
    try {
      const data = await cmsGet("/authors-public-list");
      setAuthors(data);
    } catch {
      setError("Failed to load authors");
    } finally {
      setAuthorsLoading(false);
    }
  }

  useEffect(() => {
    if (!me || section !== "authors") return;
    loadAuthors();
  }, [me, section]);

  useEffect(() => {
    if (!me || section !== "authors" || !authorId) {
      setSelectedAuthor(null);
      return;
    }
    cmsGet(`/authors-public/${authorId}`)
      .then(setSelectedAuthor)
      .catch(() => setError("Failed to load author"));
  }, [me, section, authorId]);

  if (!me) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 1120 }}>
        <h1 className="cms-heading">Admin</h1>
        <p className="cms-subheading">Manage article review, contributors, and public author profiles.</p>

        {error && <div className="cms-error">{error}</div>}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setAdminView("articles")} className={`cms-btn cms-btn-sm ${section === "articles" ? "cms-btn-primary" : "cms-btn-secondary"}`} style={{ width: "auto" }}>
            Articles
          </button>
          <button type="button" onClick={() => setAdminView("contributors")} className={`cms-btn cms-btn-sm ${section === "contributors" ? "cms-btn-primary" : "cms-btn-secondary"}`} style={{ width: "auto" }}>
            Contributors
          </button>
          <button type="button" onClick={() => setAdminView("authors")} className={`cms-btn cms-btn-sm ${section === "authors" ? "cms-btn-primary" : "cms-btn-secondary"}`} style={{ width: "auto" }}>
            Authors
          </button>
        </div>

        {section === "articles" && (
          <>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {STATUS_TABS.map((s) => (
                <button key={s} type="button" onClick={() => setAdminView("articles", s)} className={`cms-btn cms-btn-sm ${tab === s ? "cms-btn-primary" : "cms-btn-secondary"}`} style={{ width: "auto", textTransform: "capitalize" }}>
                  {s}
                </button>
              ))}
            </div>

            {drafts.length === 0 && !loading ? (
              <div className="cms-card">
                <div className="cms-empty">
                  <h3>No {tab} articles</h3>
                  <p>Nothing here yet.</p>
                </div>
              </div>
            ) : (
              <div className="cms-card">
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>Headline</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((d) => (
                      <tr key={d._id}>
                        <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.headline}</td>
                        <td>
                          <div style={{ fontSize: "0.85rem" }}>{d.authorName}</div>
                          <div style={{ fontSize: "0.72rem", color: "#9a9ab0" }}>{d.authorEmail}</div>
                        </td>
                        <td><span className="cms-tag" style={{ margin: 0 }}>{d.category}</span></td>
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>{new Date(d.submittedAt).toLocaleDateString()}</td>
                        <td><span className={`cms-status cms-status-${d.status}`}>{d.status}</span></td>
                        <td>
                          <Link href={`/cms/admin/${d._id}`} className="cms-btn cms-btn-secondary cms-btn-sm" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
                            Review -
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loading && <div style={{ paddingTop: "0.75rem", fontSize: "0.8rem", color: "#9a9ab0" }}>Updating...</div>}
              </div>
            )}

            <div className="cms-card" style={{ marginTop: "2rem" }}>
              <div className="cms-card-title">Add New Contributor</div>
              <AddAuthorForm onAdded={() => {
                setAdminView("contributors");
                loadContributors();
              }} />
            </div>
          </>
        )}

        {section === "contributors" && (
          <>
            <div className="cms-card">
              <div className="cms-card-title">Contributors</div>
              {contributors.length === 0 && !contributorsLoading ? (
                <div className="cms-empty">
                  <h3>No contributors</h3>
                  <p>Nothing here yet.</p>
                </div>
              ) : (
                <ContributorsTable contributors={contributors} currentUserEmail={me.email} onRefresh={loadContributors} />
              )}
              {contributorsLoading && contributors.length > 0 && <div style={{ paddingTop: "0.75rem", fontSize: "0.8rem", color: "#9a9ab0" }}>Updating...</div>}
            </div>

            <div className="cms-card" style={{ marginTop: "2rem" }}>
              <div className="cms-card-title">Add New Contributor</div>
              <AddAuthorForm onAdded={loadContributors} />
            </div>
          </>
        )}

        {section === "authors" && (
          <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", gap: "1rem" }}>
            <div className="cms-card">
              <div className="cms-card-title">Authors</div>
              {authorsLoading && authors.length === 0 ? (
                <div style={{ color: "#9a9ab0" }}>Loading...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {authors.map((author) => (
                    <button
                      key={author._id}
                      type="button"
                      onClick={() => setAdminView("authors", undefined, author._id)}
                      className="cms-btn cms-btn-secondary"
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                        background: authorId === author._id ? "#eadcf5" : "#f7f2fb",
                        color: "#3b3254",
                      }}
                    >
                      <span style={{ textAlign: "left" }}>
                        <strong style={{ display: "block", color: "#1a1a2e" }}>{author.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#8d88a6" }}>{author.slug}</span>
                      </span>
                      <span className={`cms-status ${author.active ? "cms-status-approved" : "cms-status-rejected"}`}>
                        {author.active ? "live" : "hidden"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="cms-card">
              <div className="cms-card-title">Author Details</div>
              {selectedAuthor ? (
                <AuthorEditor
                  author={selectedAuthor}
                  onSaved={async () => {
                    await loadAuthors();
                    const fresh = await cmsGet(`/authors-public/${selectedAuthor._id}`);
                    setSelectedAuthor(fresh);
                  }}
                  onDeleted={async () => {
                    setSelectedAuthor(null);
                    setAdminView("authors");
                    await loadAuthors();
                  }}
                />
              ) : (
                <div className="cms-empty">
                  <h3>Select an author</h3>
                  <p>Choose one from the list to edit their public profile.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ContributorsTable({
  contributors,
  currentUserEmail,
  onRefresh,
}: {
  contributors: Contributor[];
  currentUserEmail: string;
  onRefresh: () => Promise<void>;
}) {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function runAction(id: string, action: "enable" | "disable" | "delete") {
    if (action === "delete") {
      const confirmed = window.confirm("Revoke this contributor's CMS access? Author profile data stays intact.");
      if (!confirmed) return;
    }
    setBusyId(id + action);
    setError("");
    try {
      const res = action === "delete" ? await cmsDelete(`/authors/${id}`) : await cmsPost(`/authors/${id}/${action}`, {});
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }
      await onRefresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      {error && <div className="cms-error">{error}</div>}
      <table className="cms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {contributors.map((author) => {
            const isSelf = author.email === currentUserEmail;
            const isDisabled = Boolean(author.disabled);
            return (
              <tr key={author._id}>
                <td>{author.name}</td>
                <td style={{ fontSize: "0.82rem" }}>{author.email}</td>
                <td style={{ textTransform: "capitalize" }}>{author.role}</td>
                <td>
                  <span className={`cms-status ${isDisabled ? "cms-status-rejected" : "cms-status-approved"}`}>
                    {isDisabled ? "disabled" : "active"}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>{author.joinedDate || "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {isDisabled ? (
                      <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => runAction(author._id, "enable")} disabled={busyId === author._id + "enable"}>
                        Enable
                      </button>
                    ) : (
                      <button type="button" className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => runAction(author._id, "disable")} disabled={isSelf || busyId === author._id + "disable"}>
                        Disable
                      </button>
                    )}
                    <button type="button" className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => runAction(author._id, "delete")} disabled={isSelf || busyId === author._id + "delete"}>
                      Revoke Access
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function AddAuthorForm({ onAdded }: { onAdded: () => void | Promise<void> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = pass.trim();
    if (normalizedPass.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await cmsPost("/add-author", {
        name: normalizedName,
        email: normalizedEmail,
        tempPassword: normalizedPass,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add author");
        return;
      }
      setSuccess(`Author "${normalizedName}" added.`);
      setName("");
      setEmail("");
      setPass("");
      await onAdded();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="cms-error">{error}</div>}
      {success && <div className="cms-success">{success}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        <div className="cms-field" style={{ marginBottom: 0 }}>
          <label className="cms-label">Display Name <span>*</span></label>
          <input className="cms-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
        </div>
        <div className="cms-field" style={{ marginBottom: 0 }}>
          <label className="cms-label">Email <span>*</span></label>
          <input className="cms-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
        </div>
        <div className="cms-field" style={{ marginBottom: 0 }}>
          <label className="cms-label">Temp Password <span>*</span></label>
          <input className="cms-input" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 8 chars" required />
        </div>
      </div>
      <button className="cms-btn cms-btn-secondary" type="submit" disabled={loading} style={{ marginTop: "1rem", width: "auto" }}>
        {loading ? "Adding..." : "Add Contributor"}
      </button>
    </form>
  );
}

function AuthorEditor({
  author,
  onSaved,
  onDeleted,
}: {
  author: PublicAuthor;
  onSaved: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [name, setName] = useState(author.name || "");
  const [title, setTitle] = useState(author.title || "");
  const [bio, setBio] = useState(author.bio || "");
  const [achievements, setAchievements] = useState(author.achievements || "");
  const [linkedin, setLinkedin] = useState(author.social?.linkedin || "");
  const [joinedDate, setJoinedDate] = useState(author.joinedDate || "");
  const [editedCount, setEditedCount] = useState(String(author.editedCount || 0));
  const [active, setActive] = useState(author.active ?? true);
  const [expertiseText, setExpertiseText] = useState((author.expertise || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setName(author.name || "");
    setTitle(author.title || "");
    setBio(author.bio || "");
    setAchievements(author.achievements || "");
    setLinkedin(author.social?.linkedin || "");
    setJoinedDate(author.joinedDate || "");
    setEditedCount(String(author.editedCount || 0));
    setActive(author.active ?? true);
    setExpertiseText((author.expertise || []).join(", "));
    setError("");
    setSuccess("");
  }, [author]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const expertise = expertiseText.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
      const res = await cmsPut(`/authors-public/${author._id}`, {
        name,
        title,
        bio,
        achievements,
        linkedin,
        joinedDate,
        editedCount: Number(editedCount || "0"),
        active,
        expertise,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setSuccess("Author updated.");
      await onSaved();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function removeAuthor() {
    const confirmed = window.confirm("Remove this author card from /authors? Contributor account will be kept.");
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      const res = await cmsDelete(`/authors-public/${author._id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Delete failed");
        return;
      }
      await onDeleted();
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={save}>
      {error && <div className="cms-error">{error}</div>}
      {success && <div className="cms-success">{success}</div>}
      <div className="cms-field">
        <label className="cms-label">Display Name</label>
        <input className="cms-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="cms-field">
        <label className="cms-label">Title</label>
        <input className="cms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="cms-field">
        <label className="cms-label">Bio</label>
        <textarea className="cms-textarea" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="cms-field">
        <label className="cms-label">Achievements</label>
        <textarea className="cms-textarea" rows={3} value={achievements} onChange={(e) => setAchievements(e.target.value)} />
      </div>
      <div className="cms-field">
        <label className="cms-label">Expertise</label>
        <input className="cms-input" value={expertiseText} onChange={(e) => setExpertiseText(e.target.value)} placeholder="comma, separated, values" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="cms-field">
          <label className="cms-label">LinkedIn</label>
          <input className="cms-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </div>
        <div className="cms-field">
          <label className="cms-label">Contributing Since</label>
          <input className="cms-input" type="date" value={joinedDate} onChange={(e) => setJoinedDate(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="cms-field">
          <label className="cms-label">Edits Count</label>
          <input className="cms-input" type="number" min="0" value={editedCount} onChange={(e) => setEditedCount(e.target.value)} />
        </div>
        <div className="cms-field">
          <label className="cms-label">Public Visibility</label>
          <select className="cms-select" value={active ? "live" : "hidden"} onChange={(e) => setActive(e.target.value === "live")}>
            <option value="live">Live on /authors</option>
            <option value="hidden">Hidden from /authors</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="cms-btn cms-btn-danger" type="button" onClick={removeAuthor} disabled={deleting || loading}>
          {deleting ? "Removing..." : "Remove From Authors Page"}
        </button>
        <button className="cms-btn cms-btn-primary" type="submit" disabled={loading || deleting}>
          {loading ? "Saving..." : "Save Author"}
        </button>
      </div>
    </form>
  );
}
