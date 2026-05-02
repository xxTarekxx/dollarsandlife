"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { cmsPost } from "@/lib/cmsApi";

interface Props {
  userName?: string;
  role?: string;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ").filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #7C3AED, #4C1D95)",
      color: "#fff",
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      flexShrink: 0,
      border: "1.5px solid rgba(167,139,250,0.4)",
    }}>{initials}</span>
  );
}

const ROLE_LABEL: Record<string, string> = {
  admin:      "Admin",
  "sub-admin":"Sub-Admin",
  contributor:"Contributor",
  author:     "Author",
};

export default function CmsNav({ userName, role }: Props) {
  const pathname    = usePathname();
  const router      = useRouter();
  const currentPath = pathname || "";
  const isAdmin     = role === "admin" || role === "sub-admin";

  async function logout() {
    await cmsPost("/logout", {});
    router.push("/cms/login");
  }

  return (
    <nav className="cms-nav">
      {/* Brand */}
      <Link href={isAdmin ? "/cms/admin" : "/cms/dashboard"} className="cms-nav-brand">
        ✍️ <span>D&amp;L CMS</span>
        {role && (
          <span style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            padding: "0.15rem 0.45rem",
            borderRadius: 4,
            background: "rgba(167,139,250,0.18)",
            color: "#C4B5FD",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginLeft: 2,
          }}>
            {ROLE_LABEL[role] ?? role}
          </span>
        )}
      </Link>

      {/* Links */}
      <div className="cms-nav-links">
        {isAdmin && (
          <Link href="/cms/admin" className={`cms-nav-link ${currentPath.startsWith("/cms/admin") ? "active" : ""}`}>
            {role === "sub-admin" ? "Review" : "Admin"}
          </Link>
        )}
        <Link href="/cms/dashboard" className={`cms-nav-link ${currentPath === "/cms/dashboard" ? "active" : ""}`}>
          Profile
        </Link>
        {/* My Articles & Browse are for contributors only */}
        {!isAdmin && (
          <>
            <Link href="/cms/articles" className={`cms-nav-link ${currentPath.startsWith("/cms/articles") ? "active" : ""}`}>
              My Articles
            </Link>
            <Link href="/cms/other-articles" className={`cms-nav-link ${currentPath.startsWith("/cms/other-articles") ? "active" : ""}`}>
              Browse
            </Link>
          </>
        )}
      </div>

      {/* Right */}
      <div className="cms-nav-right">
        {userName && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Initials name={userName} />
            <span className="cms-nav-user">{userName}</span>
          </div>
        )}
        <button onClick={logout} className="cms-btn-logout">Log out</button>
      </div>
    </nav>
  );
}
