import Link from "next/link";
import { Pic } from "@/components/ui";
import type { HomeContent } from "@/lib/cms/pages";

/** この号の特集: a 5-cell bento of photo tiles (1 tall + 4). Text, photos, links and order come from the CMS. */
export function Features({ items }: { items: HomeContent["features"] }) {
  return (
    <section aria-labelledby="h-features" className="wrap pb-16 md:pb-24">
      <h2 id="h-features" className="sr-only">この号の特集</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
        {items.map((c, n) => {
          return (
            <li key={n} className={n === 0 ? "sm:col-span-2 lg:row-span-2" : ""}>
              <Link
                href={c.href || "/"}
                className={`group relative isolate flex h-full overflow-hidden rounded-[var(--radius-card)] bg-night text-on-night ${n === 0 ? "min-h-[260px] lg:min-h-[440px]" : "min-h-[180px] lg:min-h-0"}`}
              >
                <Pic cms={`home:features.${n}.image`} img={c.image} sizes={n === 0 ? "(min-width:1280px) 560px, (min-width:1024px) 45vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"} className="-z-10 transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/70 via-45% to-night/10" aria-hidden />
                <span className="mt-auto p-4 md:p-5">
                  <span lang="en" className="font-latin text-2xl text-[#ffb7a6] md:text-3xl">{String(n + 1).padStart(2, "0")}</span>
                  <span data-cms={`home:features.${n}.title`} className={`phrase mt-1 block font-maru font-bold leading-snug tracking-[0.06em] [text-wrap:balance] ${n === 0 ? "text-2xl md:text-[30px]" : "text-lg"}`}>{c.title}</span>
                  <span data-cms={`home:features.${n}.sub`} className="phrase mt-1 block text-[13px] text-on-night/90">{c.sub}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
