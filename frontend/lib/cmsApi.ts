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

/**
 * In local dev, article files usually live under Next `public/images` (page origin) while the CMS API
 * runs on loopback with another port. Rewrites **only** when the asset URL host is localhost/127.0.0.1
 * (not production CDNs) so prod image URLs are unchanged.
 */
export function preferPageOriginForLocalArticleImages(resolvedUrl: string, path: string): string {
  if (typeof window === "undefined" || !path.startsWith("/images/")) return resolvedUrl;
  const ph = window.location.hostname;
  if (ph !== "localhost" && ph !== "127.0.0.1") return resolvedUrl;
  try {
    const asset = new URL(resolvedUrl);
    const page = new URL(window.location.href);
    if (asset.origin === page.origin) return resolvedUrl;
    if (asset.hostname !== "localhost" && asset.hostname !== "127.0.0.1") return resolvedUrl;
    return `${page.origin}${path.startsWith("/") ? path : `/${path}`}`;
  } catch {
    return resolvedUrl;
  }
}

/**
 * Browser `<img src>` for CMS and article assets: relative `/images/...`, API-built absolute URLs,
 * and same-origin paths. Use for every article image in CMS (cover, previews, etc.).
 */
export function resolveUploadedMediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) {
    try {
      const pathname = new URL(path).pathname;
      if (pathname.startsWith("/images/")) {
        return preferPageOriginForLocalArticleImages(path, pathname);
      }
    } catch {
      return path;
    }
    return path;
  }
  // protocol-relative URLs
  if (path.startsWith("//")) {
    if (typeof window === "undefined") return `https:${path}`;
    return `${window.location.protocol}${path}`;
  }
  if (!path.startsWith("/")) return path;
  if (typeof window === "undefined") {
    const mediaOrigin =
      typeof process !== "undefined" && process.env.NEXT_PUBLIC_CMS_MEDIA_ORIGIN
        ? String(process.env.NEXT_PUBLIC_CMS_MEDIA_ORIGIN).replace(/\/$/, "")
        : "https://www.dollarsandlife.com";
    return `${mediaOrigin}${path}`;
  }
  const apiBase = getCmsApiBase();
  let resolved: string;
  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    let origin = apiBase.replace(/\/api\/?$/i, "");
    if (!origin.endsWith("/") && !path.startsWith("/")) {
      resolved = `${origin}/${path}`;
    } else {
      if (origin.endsWith("/") && path.startsWith("/")) origin = origin.slice(0, -1);
      resolved = `${origin}${path}`;
    }
  } else {
    // Same-origin `/api` (or other relative base): prefer an explicit media origin,
    // keep localhost on the current page origin, and otherwise use the canonical site host.
    const mediaOrigin =
      typeof process !== "undefined" && process.env.NEXT_PUBLIC_CMS_MEDIA_ORIGIN
        ? String(process.env.NEXT_PUBLIC_CMS_MEDIA_ORIGIN).replace(/\/$/, "")
        : "";
    if (mediaOrigin) {
      resolved = `${mediaOrigin}${path}`;
    } else {
      const host = window.location.hostname;
      const isLocalHost = host === "localhost" || host === "127.0.0.1";
      resolved = isLocalHost
        ? `${window.location.origin}${path}`
        : `https://www.dollarsandlife.com${path}`;
    }
  }
  return preferPageOriginForLocalArticleImages(resolved, path);
}

export function resolveUploadedMediaUrlWithVersion(path: string, updatedAt?: string): string {
  const resolved = resolveUploadedMediaUrl(path);
  if (!resolved || !updatedAt) return resolved;
  const version = Date.parse(updatedAt);
  const token = Number.isFinite(version) ? String(version) : updatedAt;

  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.dollarsandlife.com";
    const url = new URL(resolved, base);
    url.searchParams.set("v", token);
    return url.toString();
  } catch {
    const joiner = resolved.includes("?") ? "&" : "?";
    return `${resolved}${joiner}v=${encodeURIComponent(token)}`;
  }
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
