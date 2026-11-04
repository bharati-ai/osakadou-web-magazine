import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminBar } from "@/components/admin-bar";
import { CmsBridge } from "@/components/cms-bridge";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <AdminBar />
      <CmsBridge />
    </>
  );
}
