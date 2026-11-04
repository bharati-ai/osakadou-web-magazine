import Link from "next/link";
import { BookOpenText, CloudSun, FirstAid, MapPin, Stamp, Toolbox } from "@phosphor-icons/react/dist/ssr";
import { SECTIONS } from "@/lib/site";
import { getSiteCopy } from "@/lib/cms/pages";
import { MenuSheet } from "./menu-sheet";

const ICONS = { MapPin, CloudSun, FirstAid, Toolbox, Stamp, BookOpenText } as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-16 max-w-[1280px] items-stretch gap-4 pl-4 md:h-[72px] md:pl-8">
        <Link href="/" className="flex shrink-0 flex-col justify-center leading-none">
          <span className="font-mincho text-[23px] font-bold tracking-[0.1em] md:text-[27px]">オオサカ堂</span>
          <span data-cms="site:headerSub" className="mt-1 text-[11px] tracking-[0.14em] text-ink-2">{getSiteCopy().headerSub}</span>
        </Link>
        <nav aria-label="セクション" className="ml-auto hidden items-stretch lg:flex">
          {SECTIONS.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            return (
              <Link
                key={href}
                href={href}
                className="group flex w-[92px] flex-col items-center justify-center gap-1 text-[12.5px] font-bold tracking-[0.06em] text-ink hover:text-shu-ink"
              >
                <Icon size={26} weight="duotone" className="text-shu transition-transform group-hover:-translate-y-0.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <MenuSheet />
      </div>
    </header>
  );
}
