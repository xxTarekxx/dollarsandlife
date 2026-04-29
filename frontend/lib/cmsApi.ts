/**
 * CMS API helper — all fetch calls go directly to Express with credentials (cookies).
 */
// Browser base:
// - local dev: allow explicit localhost API base from env
// - production: force same-origin /api (avoids accidentally shipping localhost)
export function getCmsApiBase(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_REACT_APP_API_BASE || "https://www.dollarsandlife.com/api";
  }
  const host = window.location.hostname;
  if ((host === "localhost" || host === "127.0.0.1") && process.env.NEXT_PUBLIC_REACT_APP_API_BASE) {
    return process.env.NEXT_PUBLIC_REACT_APP_API_BASE;
  }
  return "/api";
}

const BASE = getCmsApiBase();

/** Uploaded article/author images live on the API host in dev (`/images/...`), not on the Next dev server — use this for `<img src>`. */
export function resolveUploadedMediaUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  if (typeof window === "undefined") return path;
  const apiBase = getCmsApiBase();
  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    const origin = apiBase.replace(/\/api\/?$/i, "");
    return `${origin}${path}`;
  }
  return `${window.location.origin}${path}`;
}

export async function cmsApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${BASE}/cms${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export async function cmsGet(path: string) {
  const res = await cmsApi(path);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function cmsPost(path: string, body: unknown) {
  const res = await cmsApi(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res;
}

export async function cmsPut(path: string, body: unknown) {
  const res = await cmsApi(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res;
}

export async function cmsDelete(path: string) {
  const res = await cmsApi(path, {
    method: "DELETE",
  });
  return res;
}

export async function cmsUpload(path: string, formData: FormData) {
  return fetch(`${BASE}/cms${path}`, {
    method: "POST",
    credentials: "include",
    body: formData, // no Content-Type header — browser sets multipart boundary
  });
}
