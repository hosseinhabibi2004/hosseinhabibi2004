import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TagChip } from "@/components/TagChip";
import type { PublicPostDetail } from "@/lib/content/types";
import { formatDate, type Locale } from "@/lib/format";

type PostSummary = Pick<
  PublicPostDetail,
  "slug" | "title" | "summary" | "published_at" | "cover_image" | "tags"
>;

interface PostCardProps {
  lng: Locale;
  post: PostSummary;
}

export function PostCard({ lng, post }: PostCardProps) {
  return (
    <article className="relative flex flex-col gap-4 rounded-[10px] border border-border bg-card p-5 text-card-foreground">
      <CoverImage image={post.cover_image} className="aspect-[1200/630]" />
      <time dateTime={post.published_at} className="text-sm font-semibold text-muted-foreground">
        {formatDate(post.published_at, lng)}
      </time>
      <h3 className="text-2xl font-semibold leading-tight tracking-tight" dir="auto">
        <Link
          href={`/${lng}/posts/${post.slug}/`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {post.title}
        </Link>
      </h3>
      <p className="text-muted-foreground" dir="auto">
        {post.summary}
      </p>
      {post.tags.length > 0 ? (
        <ul className="relative z-10 mt-auto flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <TagChip lng={lng} tag={tag} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
