import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { SITE } from "@/lib/site";
import { createUser, passwordProblem } from "./auth";
import { tx } from "./db";
import { categoryByPath } from "./categories";
import { excerptFrom, processLocalHtml } from "./html";
import { createPost, validatePost } from "./posts";

const SEED_DIR = path.join(process.cwd(), "content", "posts");

/** Runs once per process when the DB opens: first admin from env, then any new seed articles. */
export function runBootstrap(d: DatabaseSync) {
  const noUsers = !d.prepare("SELECT 1 FROM users LIMIT 1").get();
  const email = process.env.ADMIN_EMAIL?.trim();
  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (noUsers && email && pw) {
    const problem = passwordProblem(pw);
    if (problem) console.warn(`[cms] ADMIN_PASSWORD rejected: ${problem}`);
    else {
      try { createUser({ email, name: process.env.ADMIN_NAME?.trim() || "管理者", role: "admin", password: pw }); }
      catch { /* another worker created it first */ }
    }
  }
  seedPosts(d);
}

type SeedMeta = {
  title: string; slug: string; category: string; subcategory?: string; excerpt?: string; seo_title?: string; seo_description?: string;
  tags?: string[]; cover?: { src: string; alt: string }; sources?: { title: string; url: string }[]; reviewed?: string; published_at?: string;
};

/** content/posts/<slug>.html = `<!--meta {json} -->` + body. Each slug is seeded once; deleting the post later keeps it deleted. */
function seedPosts(d: DatabaseSync) {
  if (!fs.existsSync(SEED_DIR)) return;
  const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".html")).sort();
  for (const file of files) {
    const key = `seed:${file}`;
    if (d.prepare("SELECT 1 FROM meta WHERE key = ?").get(key)) continue;
    const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf8");
    const m = /^\s*<!--meta\s*([\s\S]*?)-->\s*([\s\S]*)$/.exec(raw);
    if (!m) { console.warn(`[cms] seed ${file}: missing <!--meta --> header`); continue; }
    let meta: SeedMeta;
    try { meta = JSON.parse(m[1]); } catch (e) { console.warn(`[cms] seed ${file}: bad meta JSON (${(e as Error).message})`); continue; }
    const cat = categoryByPath(meta.category, meta.subcategory);
    const body = processLocalHtml(m[2]);
    const reviewed = meta.reviewed ? new Date(`${meta.reviewed}T09:00:00+09:00`).toISOString() : null;
    const fields = {
      title: meta.title, slug: meta.slug, excerpt: meta.excerpt ?? excerptFrom(body.text), content_html: body.html,
      cover_src: meta.cover?.src ?? null, cover_alt: meta.cover?.alt ?? "", category_id: cat?.id ?? 0, tags: meta.tags ?? [],
      sources: meta.sources ?? [], status: "published" as const, author_name: SITE.editors, seo_title: meta.seo_title ?? "",
      seo_description: meta.seo_description ?? "", noindex: false, reading_minutes: body.readingMinutes,
      published_at: meta.published_at ? new Date(meta.published_at).toISOString() : (reviewed ?? new Date().toISOString()),
      reviewed_at: reviewed, external_id: `seed:${meta.slug}`, seo: {},
    };
    try {
      tx(d, () => {
        if (d.prepare("SELECT 1 FROM meta WHERE key = ?").get(key)) return; // another build worker got here first
        const errs = validatePost(fields);
        if (errs.length) return console.warn(`[cms] seed ${file} skipped (fix the file and restart): ${errs.join("; ")}`);
        createPost(fields, "seed", SITE.editors);
        d.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run(key, new Date().toISOString());
        if (body.warnings.length) console.info(`[cms] seed ${file}: ${body.warnings.join(" / ")}`);
      });
    } catch (e) {
      console.warn(`[cms] seed ${file} failed: ${(e as Error).message}`);
    }
  }
}
