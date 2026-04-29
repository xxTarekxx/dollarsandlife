import type { Metadata } from "next";
import { fetchInternal } from "@/lib/fetchInternal";
import AuthorsClient from "./AuthorsClient";

export const metadata: Metadata = {
  title: "Our Authors | Dollars & Life",
  description:
    "Meet the contributors behind Dollars & Life — real people sharing real-world money strategies, side hustles, and financial insights.",
  openGraph: {
    title: "Our Authors | Dollars & Life",
    description:
      "Meet the contributors behind Dollars & Life — real people sharing real-world money strategies.",
    type: "website",
    url: "https://www.dollarsandlife.com/authors",
    images: ["https://www.dollarsandlife.com/og-image-homepage.jpg"],
  },
};

export default async function AuthorsPage() {
  let authors: Author[] = [];
  let error: string | undefined;

  try {
    const res = await fetchInternal("/authors");
    if (res.ok) {
      authors = await res.json();
    } else {
      error = `Failed to load authors (${res.status})`;
    }
  } catch {
    error = "Failed to load authors.";
  }

  return <AuthorsClient authors={authors} error={error} />;
}

export interface Author {
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
}
