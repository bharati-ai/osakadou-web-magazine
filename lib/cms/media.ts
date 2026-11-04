import crypto from "node:crypto";
import dns from "node:dns";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { UPLOAD_DIR, db } from "./db";

export type Media = {
  id: number; path: string; sha256: string; mime: string; width: number; height: number; bytes: number;
  alt: string; original_name: string | null; source_url: string | null; created_by: string; created_at: string;
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 2000;
// ~40 MP decodes to ~160 MB RGBA; caps decompression bombs well within the 10 MB byte limit
const MAX_PIXELS = 40_000_000;
const FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "heif", "tiff"]);

export class MediaError extends Error {}

export const mediaUrl = (p: string) => `/media/${p}`;

// --- SSRF-safe download: every resolved address is checked at connect time, so DNS rebinding cannot reach the LAN.
const BLOCK = new net.BlockList();
for (const [a, n] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 3]] as const)
  BLOCK.addSubnet(a, n, "ipv4");
for (const [a, n] of [["::", 127], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8], ["64:ff9b::", 96], ["2001:db8::", 32]] as const) BLOCK.addSubnet(a, n, "ipv6");

function blocked(ip: string, family: number) {
  if (family === 6 && ip.toLowerCase().startsWith("::ffff:")) return true; // IPv4-mapped: public hosts resolve as family 4 anyway
  return BLOCK.check(ip, family === 6 ? "ipv6" : "ipv4");
}

const safeLookup: net.LookupFunction = (host, opts, cb) => {
  dns.lookup(host, { all: true }, (err, addrs) => {
    if (err) return cb(err, "", 4);
    const bad = addrs.find((a) => blocked(a.address, a.family));
    if (bad || !addrs.length) return cb(new Error(`address not allowed for ${host}`), "", 4);
    if ((opts as dns.LookupAllOptions).all) return (cb as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
};

export async function download(url: string, redirects = 3): Promise<{ buf: Buffer; type: string }> {
  let u: URL;
  try { u = new URL(url); } catch { throw new MediaError(`invalid image URL: ${url.slice(0, 120)}`); }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new MediaError(`unsupported URL scheme: ${u.protocol}`);
  if (u.port && !["80", "443", "8080", "8443"].includes(u.port)) throw new MediaError(`port not allowed: ${u.port}`);
  if (u.username || u.password) throw new MediaError("credentials in URL are not allowed");
  // Node skips `lookup` for IP literals, so check those here.
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && blocked(host, net.isIP(host))) throw new MediaError("address not allowed (private or reserved range)");
  const mod = u.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.get(u, { lookup: safeLookup, timeout: 15_000, headers: { "user-agent": "OSAKADOU-CMS/1.0 (+https://osakadou.live)", accept: "image/*" } }, (res) => {
      const code = res.statusCode ?? 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        if (redirects <= 0) return reject(new MediaError("too many redirects"));
        return resolve(download(new URL(res.headers.location, u).toString(), redirects - 1));
      }
      if (code !== 200) { res.resume(); return reject(new MediaError(`image download failed: HTTP ${code} ${u.host}`)); }
      const len = Number(res.headers["content-length"] ?? 0);
      if (len > MAX_IMAGE_BYTES) { res.destroy(); return reject(new MediaError("image is larger than 10MB")); }
      const chunks: Buffer[] = [];
      let size = 0;
      res.on("data", (c: Buffer) => {
        size += c.length;
        if (size > MAX_IMAGE_BYTES) { res.destroy(); reject(new MediaError("image is larger than 10MB")); }
        else chunks.push(c);
      });
      res.on("end", () => resolve({ buf: Buffer.concat(chunks), type: String(res.headers["content-type"] ?? "") }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new MediaError("image download timed out (15s)")));
    req.on("error", (e) => reject(e instanceof MediaError ? e : new MediaError(`image download failed: ${e.message}`)));
  });
}

export function decodeDataUri(uri: string): Buffer {
  const m = /^data:image\/(png|jpe?g|webp|gif|avif);base64,([a-z0-9+/=\s]+)$/i.exec(uri);
  if (!m) throw new MediaError("unsupported data URI (use base64 png, jpeg, webp, gif or avif)");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_IMAGE_BYTES) throw new MediaError("image is larger than 10MB");
  return buf;
}

/** Validate, re-encode to WebP (≤2000px, EXIF/GPS stripped) and store once per content hash. */
export async function storeImage(buf: Buffer, meta: { alt?: string; originalName?: string; sourceUrl?: string; by: string }): Promise<Media> {
  let info: Metadata;
  try {
    info = await sharp(buf, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new MediaError("file is not a readable image");
  }
  if (!info.format || !FORMATS.has(info.format)) throw new MediaError(`image format not allowed: ${info.format ?? "unknown"}`);
  let out: { data: Buffer; info: { width: number; height: number } };
  try {
    out = await sharp(buf, { limitInputPixels: MAX_PIXELS, animated: false })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    // a valid header with a broken body (or too many pixels) must not surface as a 500
    throw new MediaError("image could not be decoded (corrupt or too large)");
  }
  const hash = crypto.createHash("sha256").update(out.data).digest("hex");
  const d = db();
  const existing = d.prepare("SELECT * FROM media WHERE sha256 = ?").get(hash) as Media | undefined;
  if (existing) {
    if (meta.alt && !existing.alt) d.prepare("UPDATE media SET alt = ? WHERE id = ?").run(meta.alt, existing.id);
    return existing;
  }
  const now = new Date();
  const rel = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${hash.slice(0, 20)}.webp`;
  const abs = path.join(UPLOAD_DIR, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, out.data);
  const id = Number(
    d.prepare(
      "INSERT INTO media (path, sha256, mime, width, height, bytes, alt, original_name, source_url, created_by) VALUES (?, ?, 'image/webp', ?, ?, ?, ?, ?, ?, ?)",
    ).run(rel, hash, out.info.width, out.info.height, out.data.length, meta.alt ?? "", meta.originalName?.slice(0, 200) ?? null, meta.sourceUrl?.slice(0, 1000) ?? null, meta.by).lastInsertRowid,
  );
  return d.prepare("SELECT * FROM media WHERE id = ?").get(id) as Media;
}

/** Ingest from an http(s) URL or a data: URI. */
export async function ingestImage(src: string, meta: { alt?: string; by: string }): Promise<Media> {
  if (src.startsWith("data:")) return storeImage(decodeDataUri(src), meta);
  const { buf } = await download(src);
  return storeImage(buf, { ...meta, sourceUrl: src, originalName: path.basename(new URL(src).pathname) });
}

export function mediaByPath(rel: string) {
  return db().prepare("SELECT * FROM media WHERE path = ?").get(rel) as Media | undefined;
}

export function listMedia(opts: { q?: string; limit?: number; offset?: number } = {}) {
  const q = `%${opts.q ?? ""}%`;
  return db()
    .prepare("SELECT * FROM media WHERE alt LIKE ? OR ifnull(original_name,'') LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?")
    .all(q, q, opts.limit ?? 60, opts.offset ?? 0) as Media[];
}

/** Where a media file is used (posts' bodies/covers and page content). */
export function mediaUsage(m: Media) {
  const url = mediaUrl(m.path);
  const like = `%${url}%`;
  const posts = db().prepare("SELECT id, title FROM posts WHERE content_html LIKE ? OR cover_src = ?").all(like, url) as { id: number; title: string }[];
  const pages = db()
    .prepare("SELECT DISTINCT page FROM page_versions p WHERE version = (SELECT max(version) FROM page_versions WHERE page = p.page) AND data LIKE ?")
    .all(like) as { page: string }[];
  return { posts, pages: pages.map((p) => p.page) };
}

export function deleteMedia(m: Media) {
  db().prepare("DELETE FROM media WHERE id = ?").run(m.id);
  fs.rmSync(path.join(UPLOAD_DIR, m.path), { force: true });
}
