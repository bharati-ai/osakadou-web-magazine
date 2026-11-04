import type { Metadata } from "next";
import { HomeSections } from "@/components/home/home-sections";
import { SITE } from "@/lib/site";
import { getHome } from "@/lib/cms/pages";
import { getSeo, seoMeta } from "@/lib/cms/seo";

export function generateMetadata(): Metadata {
  const s = getSeo();
  const m = seoMeta("/", s.siteTitle, s.siteDescription, { openGraph: { title: s.siteTitle, description: s.ogDescription } });
  // the home title is the full site title: no template suffix
  return { ...m, title: { absolute: (m.title as string) || s.siteTitle } };
}

// Re-render at most every 10 minutes so the server-rendered weather stays fresh.
export const revalidate = 600;

function jsonLd(title: string, description: string, sameAs: string[]) {
  return {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: SITE.url, name: SITE.name, alternateName: [SITE.nameEn, "Osakadou", "osakadou.live"], inLanguage: "ja", publisher: { "@id": `${SITE.url}/#org` } },
    {
      "@type": ["Organization", "NewsMediaOrganization"], "@id": `${SITE.url}/#org`, name: SITE.name, alternateName: [SITE.nameEn, "Osakadou"], url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo-512.png`, width: 512, height: 512 },
      ...(sameAs.length ? { sameAs } : {}),
      publishingPrinciples: `${SITE.url}/about#policy`, correctionsPolicy: `${SITE.url}/about#policy`, ethicsPolicy: `${SITE.url}/about#policy`,
    },
    { "@type": "WebPage", "@id": `${SITE.url}/#webpage`, url: SITE.url, name: title, description, inLanguage: "ja", isPartOf: { "@id": `${SITE.url}/#website` }, about: { "@type": "City", name: "大阪市", sameAs: "https://www.wikidata.org/wiki/Q35765" } },
  ],
  };
}

export default function Home() {
  const c = getHome();
  const seo = getSeo();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(seo.siteTitle, seo.siteDescription, seo.sameAs)).replace(/</g, "\\u003c") }} />
      <HomeSections c={c} />
    </>
  );
}
