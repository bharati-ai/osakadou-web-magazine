import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { photoPos, photos, photoSrc, srcPos, type PhotoSlot } from "@/lib/photos";

/** Centered section title, OSAKA-INFO style: rounded gothic heading with a small Latin subtitle. */
export function SectionTitle({ id, ja, en, tag, light, cms, tagCms }: { id: string; ja: React.ReactNode; en: string; tag?: string; light?: boolean; cms?: string; tagCms?: string }) {
  return (
    <div className="mb-8 text-center md:mb-12">
      {tag && (
        <span data-cms={tagCms} className="mb-3 inline-block rounded-[var(--radius-chip)] border border-shu px-2 py-1 text-xs font-bold leading-none text-shu-ink">{tag}</span>
      )}
      <h2 id={id} data-cms={cms} className={`font-maru text-[26px] font-bold tracking-[0.08em] md:text-[34px] ${light ? "text-white" : ""}`}>
        {ja}
      </h2>
      <p lang="en" className={`mt-1 font-latin text-sm tracking-[0.12em] ${light ? "text-white/80" : "text-ink-2"}`}>{en}</p>
    </div>
  );
}

/** Pill link with a hard shadow: 「〜をもっと見る ›」. */
export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center gap-6 rounded-full border-2 border-ink bg-card px-8 font-maru text-sm font-bold shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-y-px"
    >
      {children}
      <CaretRight size={14} weight="bold" aria-hidden />
    </Link>
  );
}

type PhotoProps = { slot: PhotoSlot; ar?: string; sizes: string; className?: string; priority?: boolean; fill?: boolean };

/** next/image over the self-hosted photos in public/photos. Use `fill` inside a sized, relative parent. */
export function Photo({ slot, ar, sizes, className, priority, fill }: PhotoProps) {
  const p = photos[slot];
  const [aw, ah] = ar ? ar.split(":").map(Number) : [p.w, p.h];
  const dims = fill ? { fill: true as const } : { width: 1200, height: Math.round((1200 * ah) / aw) };
  return (
    <Image
      src={photoSrc(slot)}
      alt={p.alt}
      sizes={sizes}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className ?? ""}`}
      style={photoPos(slot)}
      {...dims}
    />
  );
}

/** next/image for CMS content images ({ src, alt }); renders nothing for an empty slot. Use inside a sized, relative parent. */
export function Pic({ img, sizes, className, priority, cms }: { img: { src: string; alt: string }; sizes: string; className?: string; priority?: boolean; cms?: string }) {
  if (!img.src) return null;
  return <Image data-cms={cms} src={img.src} alt={img.alt} fill sizes={sizes} loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined} className={`object-cover ${className ?? ""}`} style={srcPos(img.src)} />;
}
