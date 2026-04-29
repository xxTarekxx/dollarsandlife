export const FORUM_TAGS = [
  "budgeting",
  "saving",
  "investing",
  "credit",
  "side hustles",
  "debt",
  "freelancing",
  "real estate",
  "taxes",
  "retirement",
] as const;

export type ForumTag = (typeof FORUM_TAGS)[number];

export function normalizeForumTag(input: string): ForumTag | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  const matched = FORUM_TAGS.find((tag) => tag === normalized);
  return matched ?? null;
}

