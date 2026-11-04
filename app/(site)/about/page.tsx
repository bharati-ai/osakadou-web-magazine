import type { Metadata } from "next";
import { AboutView } from "@/components/about-view";
import { getAboutPage, getHome } from "@/lib/cms/pages";
import { SITE } from "@/lib/site";
import { getSeo, seoMeta } from "@/lib/cms/seo";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const a = getAboutPage();
  return seoMeta("/about", a.title, a.metaDescription);
}

/** オオサカ堂について: what the magazine is, how it writes, and its policies (no operator details by the owner's choice). */
export default function AboutPage() {
  const a = getAboutPage();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE.url}/about`,
    url: `${SITE.url}/about`,
    name: `${a.title}｜${SITE.name}`,
    inLanguage: "ja",
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, alternateName: SITE.nameEn, url: SITE.url, logo: `${SITE.url}/logo-512.png`, ...(getSeo().sameAs.length ? { sameAs: getSeo().sameAs } : {}) },
  };
  return (
    <AboutView a={a} policy={getHome().policy}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </AboutView>
  );
}
