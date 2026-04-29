/**
 * CMS API helper — all fetch calls go directly to Express with credentials (cookies).
 */
// Browser should always call same-origin /api (avoids accidentally shipping localhost).
// Server-side fallback still supports explicit env-based API URL.
const BASE =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.NEXT_PUBLIC_REACT_APP_API_BASE || "https://www.dollarsandlife.com/api");

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
