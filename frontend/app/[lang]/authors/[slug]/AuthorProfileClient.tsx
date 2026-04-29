"use client";

import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import "../authors.css";

const COLLECTION_ROUTE_MAP: Record<string, string> = {
  breaking_news: "breaking-news",
  budget_data: "extra-income/budget",
  freelance_jobs: "extra-income/freelance-jobs",
  money_making_apps: "extra-income/money-making-apps",
  remote_jobs: "extra-income/remote-online-jobs",
  start_a_blog: "start-a-blog",
};

interface Article {
  id: string;
  headline: string;
  image?: { url: string; caption?: string } | string;
  datePublished?: string;
  excerpt?: string;
  collection: string;
}

interface Author {
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  expertise: string[];
  social: { linkedin?: string };
  joinedDate: string;
  articleCount: number;
  editedCount?: number;
  articles: Article[];
}

interface Props {
  author: Author | null;
  error?: string;
}

export default function AuthorProfileClient({ author, error }: Props) {
  if (error || !author) {
    return (
      <div className="author-profile">
        <div className="author-not-found">
          <h1>Author not found</h1>
          <p>{error || "This author profile does not exist."}</p>
          <Link href="/authors">← Back to all contributors</Link>
        </div>
      </div>
    );
  }

  const joinedYear = author.joinedDate
    ? new Date(author.joinedDate).getFullYear()
    : null;

  return (
    <div className="author-profile">

      {/* ── Profile hero ── */}
      <div className="author-profile-card">
        <Image
          src={author.image || "/images/authors/placeholder.webp"}
          alt={author.name}
          width={110}
          height={110}
          className="author-profile-image"
          unoptimized
        />
        <div className="author-profile-info">
          <h1 className="author-profile-name">{author.name}</h1>
          <div className="author-profile-title">{author.title}</div>
          <p className="author-profile-bio">{author.bio}</p>
          {author.expertise?.length > 0 && (
            <div className="author-profile-expertise">
              {author.expertise.map((tag) => (
                <span key={tag} className="author-tag">{tag}</span>
              ))}
            </div>
          )}
          {author.social?.linkedin && (
            <a
              href={author.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="author-social-link"
            >
              <FontAwesomeIcon icon={faLinkedin} style={{ width: 18, height: 18 }} />
            LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="author-stats-bar">
        {author.articleCount > 0 && (
          <div className="author-stat">
            <span className="author-stat-value">{author.articleCount}</span>
            <span className="author-stat-label">Published</span>
          </div>
        )}
        {author.editedCount !== undefined && author.editedCount > 0 && (
          <div className="author-stat">
            <span className="author-stat-value">{author.editedCount}</span>
            <span className="author-stat-label">Edited</span>
          </div>
        )}
        {joinedYear && (
          <div className="author-stat">
            <span className="author-stat-value">{joinedYear}</span>
            <span className="author-stat-label">Contributing since</span>
          </div>
        )}
      </div>

      {/* ── Articles ── */}
      {author.articles?.length > 0 && (
        <div className="author-articles-section">
          <h2 className="author-articles-heading">Published Articles</h2>

          {author.articles.map((article) => {
            const route = COLLECTION_ROUTE_MAP[article.collection] || "breaking-news";
            const imageUrl =
              typeof article.image === "object" ? article.image?.url : article.image;

            return (
              <Link
                key={article.id}
                href={`/${route}/${article.id}`}
                className="author-article-card"
              >
                {imageUrl && (
                  <div className="author-article-image-wrap">
                    <Image
                      src={imageUrl}
                      alt={article.headline}
                      fill
                      className="author-article-image"
                      sizes="200px"
                      unoptimized
                    />
                  </div>
                )}
                <div className="author-article-body">
                  <p className="author-article-headline">{article.headline}</p>
                  {article.excerpt && (
                    <p className="author-article-excerpt">{article.excerpt}</p>
                  )}
                  <div className="author-article-footer">
                    {article.datePublished && (
                      <span className="author-article-date">
                        {new Date(article.datePublished).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    )}
                    <span className="author-article-cta">Read →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
