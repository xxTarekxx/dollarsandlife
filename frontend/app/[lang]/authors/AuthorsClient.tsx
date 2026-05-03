"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { resolveUploadedMediaUrlWithVersion } from "@/lib/cmsApi";
import type { Author } from "./page";
import "./authors.css";

interface Props {
  authors: Author[];
  error?: string;
}

export default function AuthorsClient({ authors, error }: Props) {
  if (error) {
    return (
      <div className="authors-page">
        <p className="authors-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="authors-page">
      <div className="authors-hero">
        <div className="authors-eyebrow">✍️ Contributors</div>
        <h1 className="authors-hero-title">
          Meet the people behind <span>Dollars & Life</span>
        </h1>
        <p className="authors-hero-sub">
          Real contributors sharing real-world money strategies. Want to write for us?{" "}
          <Link href="/contact-us">Get in touch</Link>.
        </p>
      </div>

      <div className="authors-grid">
        {authors.map((author) => (
          <Link key={author.slug} href={`/authors/${author.slug}`} className="author-card">
            <div className="author-card-image-wrap">
              <Image
                src={resolveUploadedMediaUrlWithVersion(
                  author.image || "/images/authors/placeholder.webp",
                  author.imageUpdatedAt
                )}
                alt={author.name}
                width={320}
                height={220}
                className="author-card-image"
                unoptimized
              />
            </div>
            <div className="author-card-body">
              <h2 className="author-card-name">{author.name}</h2>
              <span className="author-card-title">{author.title}</span>
              <p className="author-card-bio">{author.bio}</p>
              {author.expertise?.length > 0 && (
                <div className="author-card-expertise">
                  {author.expertise.map((tag) => (
                    <span key={tag} className="author-tag">{tag}</span>
                  ))}
                </div>
              )}
              {(author.articleCount > 0 ||
                (typeof author.editedCount === "number" && author.editedCount > 0) ||
                Boolean(author.joinedDate)) && (
                <div className="author-card-stats">
                  {author.articleCount > 0 && (
                    <span className="author-card-count">
                      Published: {author.articleCount}
                    </span>
                  )}
                  {typeof author.editedCount === "number" && author.editedCount > 0 && (
                    <span className="author-card-count">
                      Edits: {author.editedCount}
                    </span>
                  )}
                  {author.joinedDate && (
                    <span className="author-card-count">
                      Contributing since: {new Date(author.joinedDate).getFullYear()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
