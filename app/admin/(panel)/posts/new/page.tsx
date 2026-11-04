import type { Metadata } from "next";
import { requireUser } from "@/lib/cms/auth";
import { can } from "@/lib/cms/perms";
import { BackLink } from "@/components/admin/ui";
import { categoryTree } from "@/lib/cms/categories";
import { getL } from "@/lib/cms/lang";
import { SITE } from "@/lib/site";
import { PostForm } from "@/components/admin/post-form";
import { formValues } from "../form-values";

export async function generateMetadata(): Promise<Metadata> {
  const L = await getL();
  return { title: L("新規記事", "New post") };
}

export default async function NewPost() {
  const me = await requireUser("posts.create");
  const L = await getL();
  const head = (
    <>
      <BackLink href="/admin/posts">{L("記事一覧", "All posts")}</BackLink>
      <h1 className="font-maru text-lg font-bold">{L("新規記事", "New post")}</h1>
    </>
  );
  return (
    <div className="grid gap-4">
      <PostForm values={formValues(undefined, { author: SITE.editors })} categories={categoryTree()} head={head} canPublish={can(me, "posts.publish")} />
    </div>
  );
}
