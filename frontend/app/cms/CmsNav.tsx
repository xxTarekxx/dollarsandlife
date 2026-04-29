"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { cmsPost } from "@/lib/cmsApi";

interface Props {
  userName?: string;
  role?: string;
}

export default function CmsNav({ userName, role }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  async function logout() {
    await cmsPost("/logout", {});
    router.push("/cms/login");
  }

  return (
    <nav className="cms-nav">
      <Link href={role === "admin" ? "/cms/admin" : "/cms/dashboard"} className="cms-nav-brand">
        ✍️ D&L CMS
      </Link>

      <div className="cms-nav-links">
        {role === "admin" && (
          <Link href="/cms/admin" className={`cms-nav-link ${pathname.startsWith("/cms/admin") ? "active" : ""}`}>
            Admin
          </Link>
        )}
        <Link href="/cms/dashboard" className={`cms-nav-link ${pathname === "/cms/dashboard" ? "active" : ""}`}>
          My Profile
        </Link>
        <Link href="/cms/articles" className={`cms-nav-link ${pathname.startsWith("/cms/articles") ? "active" : ""}`}>
          My Articles
        </Link>
      </div>

      <div className="cms-nav-right">
        {userName && <span className="cms-nav-user">{userName}</span>}
        <button onClick={logout} className="cms-btn-logout">Log out</button>
      </div>
    </nav>
  );
}
