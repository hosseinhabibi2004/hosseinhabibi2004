"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { LoadError } from "@/components/LoadError";
import { StatGrid, StatTile } from "@/components/StatGrid";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { postTitle } from "@/features/posts/post-title";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format";
import { Author } from "@/sdk/generated";

const LATEST = 5;

/** The home screen: how much content there is, and the posts written last. */
export function Dashboard() {
  const { t, i18n } = useT("dashboard");
  const posts = useQuery({
    queryKey: ["dashboard", "posts"],
    queryFn: async () => {
      const { data, error } = await Author.authorPostsList({ query: { page_size: LATEST } });
      if (error || !data) throw new Error("posts");
      return data.result;
    },
  });
  const projects = useQuery({
    queryKey: ["dashboard", "projects"],
    queryFn: async () => {
      const { data, error } = await Author.authorProjectsList({ query: { page_size: 1 } });
      if (error || !data) throw new Error("projects");
      return data.result;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {posts.data && projects.data ? (
        <StatGrid count={2}>
          <StatTile label={t("stats.posts")} value={formatNumber(posts.data.count, i18n.language)} href="/posts" />
          <StatTile label={t("stats.projects")} value={formatNumber(projects.data.count, i18n.language)} />
        </StatGrid>
      ) : projects.isError ? (
        <LoadError onRetry={() => projects.refetch()} />
      ) : (
        <Skeleton className="h-20 w-full" />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">{t("latest")}</h2>
        {posts.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : posts.isError ? (
          <LoadError onRetry={() => posts.refetch()} />
        ) : posts.data.results.length === 0 ? (
          <EmptyState icon={FileText} title={t("empty")} />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {posts.data.results.map((post) => (
              <li key={post.uuid} className="flex items-center gap-3 p-3">
                <Link
                  href={`/posts/${post.uuid}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {postTitle(post, t("untitled"))}
                </Link>
                <span className="flex shrink-0 gap-1">
                  {(["en", "fa"] as const).map((locale) => (
                    <StatusBadge
                      key={locale}
                      locale={locale}
                      status={post.translations.find((row) => row.locale === locale)?.status ?? "empty"}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
