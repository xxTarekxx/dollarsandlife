"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { cmsDelete, cmsGet, cmsPost } from "@/lib/cmsApi";
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

interface Me {
  name: string;
  role: string;
  email: string;
}

const STATUS_TABS = ["pending", "approved", "rejected"] as const;

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [section, setSection] = useState<"articles" | "contributors">("articles");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cmsGet("/me").then(user => {
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

  if (!me) return <div className="cms-body" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <>
      <CmsNav userName={me.name} role={me.role} />
      <div className="cms-page" style={{ maxWidth: 1000 }}>
        <h1 className="cms-heading">Admin</h1>
        <p className="cms-subheading">Manage article review and contributors.</p>

        {error && <div className="cms-error">{error}</div>}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            type="button"
            onClick={() => setSection("articles")}
            className={`cms-btn cms-btn-sm ${section === "articles" ? "cms-btn-primary" : "cms-btn-secondary"}`}
            style={{ width: "auto" }}
          >
            Articles
          </button>
          <button
            type="button"
            onClick={() => setSection("contributors")}
            className={`cms-btn cms-btn-sm ${section === "contributors" ? "cms-btn-primary" : "cms-btn-secondary"}`}
            style={{ width: "auto" }}
          >
            Contributors
          </button>
        </div>

        {section === "articles" ? (
          <>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {STATUS_TABS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(s)}
                  className={`cms-btn cms-btn-sm ${tab === s ? "cms-btn-primary" : "cms-btn-secondary"}`}
                  style={{ width: "auto", textTransform: "capitalize" }}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#9a9ab0" }}>Loading...</div>
            ) : drafts.length === 0 ? (
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
                    {drafts.map(d => (
                      <tr key={d._id}>
                        <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.headline}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem" }}>{d.authorName}</div>
                          <div style={{ fontSize: "0.72rem", color: "#9a9ab0" }}>{d.authorEmail}</div>
                        </td>
                        <td><span className="cms-tag" style={{ margin: 0 }}>{d.category}</span></td>
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                          {new Date(d.submittedAt).toLocaleDateString()}
                        </td>
                        <td><span className={`cms-status cms-status-${d.status}`}>{d.status}</span></td>
                        <td>
                          <Link
                            href={`/cms/admin/${d._id}`}
                            className="cms-btn cms-btn-secondary cms-btn-sm"
                            style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            Review ->
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="cms-card" style={{ marginTop: "2rem" }}>
              <div className="cms-card-title">Add New Contributor</div>
              <AddAuthorForm onAdded={() => {
                setSection("contributors");
                loadContributors();
              }} />
            </div>
          </>
        ) : (
          <>
            <div className="cms-card">
              <div className="cms-card-title">Contributors</div>
              {contributorsLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9a9ab0" }}>Loading...</div>
              ) : contributors.length === 0 ? (
                <div className="cms-empty">
                  <h3>No contributors</h3>
                  <p>Nothing here yet.</p>
                </div>
              ) : (
                <ContributorsTable
                  contributors={contributors}
                  currentUserEmail={me.email}
                  onRefresh={loadContributors}
                />
              )}
            </div>

            <div className="cms-card" style={{ marginTop: "2rem" }}>
              <div className="cms-card-title">Add New Contributor</div>
              <AddAuthorForm onAdded={loadContributors} />
            </div>
          </>
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
    setBusyId(id + action);
    setError("");
    try {
      const res = action === "delete"
        ? await cmsDelete(`/authors/${id}`)
        : await cmsPost(`/authors/${id}/${action}`, {});
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
          {contributors.map(author => {
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
                <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                  {author.joinedDate || "-"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {isDisabled ? (
                      <button
                        type="button"
                        className="cms-btn cms-btn-secondary cms-btn-sm"
                        onClick={() => runAction(author._id, "enable")}
                        disabled={busyId === author._id + "enable"}
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="cms-btn cms-btn-ghost cms-btn-sm"
                        onClick={() => runAction(author._id, "disable")}
                        disabled={isSelf || busyId === author._id + "disable"}
                      >
                        Disable
                      </button>
                    )}
                    <button
                      type="button"
                      className="cms-btn cms-btn-danger cms-btn-sm"
                      onClick={() => runAction(author._id, "delete")}
                      disabled={isSelf || busyId === author._id + "delete"}
                    >
                      Delete
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
    if (pass.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await cmsPost("/add-author", { name, email, tempPassword: pass });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add author");
        return;
      }
      setSuccess(`Author "${name}" added.`);
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
          <input className="cms-input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required />
        </div>
        <div className="cms-field" style={{ marginBottom: 0 }}>
          <label className="cms-label">Email <span>*</span></label>
          <input className="cms-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
        </div>
        <div className="cms-field" style={{ marginBottom: 0 }}>
          <label className="cms-label">Temp Password <span>*</span></label>
          <input className="cms-input" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 8 chars" required />
        </div>
      </div>
      <button
        className="cms-btn cms-btn-secondary"
        type="submit"
        disabled={loading}
        style={{ marginTop: "1rem", width: "auto" }}
      >
        {loading ? "Adding..." : "Add Contributor"}
      </button>
    </form>
  );
}
