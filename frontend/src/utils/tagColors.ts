// src/utils/tagColors.ts
type TagStyle = { bg: string; text: string };

const tagColors: Record<string, TagStyle> = {
  budgeting: { bg: "#f59e0b", text: "#000" },
  saving: { bg: "#10b981", text: "#fff" },
  investing: { bg: "#3b82f6", text: "#fff" },
  credit: { bg: "#ef4444", text: "#fff" },
  "side hustles": { bg: "#6366f1", text: "#fff" },
  debt: { bg: "#e11d48", text: "#fff" },
  freelancing: { bg: "#14b8a6", text: "#fff" },
  "real estate": { bg: "#8b5cf6", text: "#fff" },
  taxes: { bg: "#f97316", text: "#000" },
  retirement: { bg: "#0ea5e9", text: "#fff" },
};

export default tagColors;
