const BASE_URL = import.meta.env.VITE_API_BASE;
if (!BASE_URL) throw new Error("VITE_API_BASE missing");

export async function http(
  path,
  { method = "GET", query, body, headers, signal } = {},
) {
  const url = new URL(path, BASE_URL);
  if (query)
    Object.entries(query).forEach(
      ([k, v]) => v != null && url.searchParams.append(k, v),
    );
  const init = { method, headers, signal };
  if (body != null) {
    init.headers = { "Content-Type": "application/json", ...headers };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : res.text();
}
