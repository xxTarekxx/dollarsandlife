import type { Metadata } from "next";
import { fetchInternal } from "@/lib/fetchInternal";
import AuthorProfileClient from "./AuthorProfileClient";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetchInternal(`/authors/${slug}`);
    if (res.ok) {
      const author = await res.json();
      return {
        title: `${author.name} | Dollars & Life`,
        description: author.bio,
        openGraph: {
          title: `${author.name} | Dollars & Life`,
          description: author.bio,
          type: "profile",
          images: [`https://www.dollarsandlife.com${author.image}`],
        },
      };
    }
  } catch (_) {
    // metadata fetch failed — return fallback
  }
  return { title: "Author | Dollars & Life" };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  let author = null;
  let error: string | undefined;

  try {
    const res = await fetchInternal(`/authors/${slug}`);
    if (res.ok) {
      author = await res.json();
    } else if (res.status === 404) {
      return <AuthorProfileClient author={null} error="Author not found." />;
    } else {
      error = `Failed to load author (${res.status})`;
    }
  } catch {
    error = "Failed to load author.";
  }

  return <AuthorProfileClient author={author} error={error} />;
}
