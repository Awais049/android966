export function extractYouTubeId(input: string | null | undefined): string {
  if (!input) return "";
  const s = String(input).trim();
  // Already looks like a bare ID (YouTube IDs are 11 chars, letters/digits/_-)
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s);
    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      if (id) return id;
    }
    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v) return v;
    // youtube.com/embed/<id> or /shorts/<id> or /live/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const known = ["embed", "shorts", "live", "v"];
    for (let i = 0; i < parts.length; i++) {
      if (known.includes(parts[i]) && parts[i + 1]) return parts[i + 1];
    }
  } catch {
    // Not a URL — try a loose regex
    const m = s.match(/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  return s;
}
