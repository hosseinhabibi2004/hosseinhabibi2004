import type { ReactNode } from "react";

import { JsonLd } from "@/components/JsonLd";
import { getPost } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { blogPostingJsonLd } from "@/lib/seo";

// The BlogPosting JSON-LD lives in the route layout so the page itself renders only the article.
export default async function PostLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; slug: string }>;
}) {
  const { lng, slug } = await params;
  if (!isLocale(lng)) return children;
  const post = getPost(lng, slug);
  return (
    <>
      {post ? <JsonLd data={blogPostingJsonLd(post, lng)} /> : null}
      {children}
    </>
  );
}
