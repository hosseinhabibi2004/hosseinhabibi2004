"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { useTableParams } from "@/components/data-table/useTableParams";
import { PageHeader } from "@/components/PageHeader";
import { UrlTabs } from "@/components/UrlTabs";
import { buttonVariants } from "@/components/ui/button";
import { PostActions, postColumns } from "@/features/posts/posts-columns";
import { POSTS_PAGE_SIZE, usePosts, usePostTrashing } from "@/features/posts/posts-service";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/api-errors";
import type { Post } from "@/sdk/generated";

/** The Posts screen: a tab for the live posts, a tab for the Trash. */
export function PostsList() {
  const { t } = useT("posts");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        actions={
          <Link href="/posts/new" className={buttonVariants()}>
            <Plus aria-hidden />
            {t("actions.new")}
          </Link>
        }
      />
      <UrlTabs
        label={t("title")}
        sections={[
          { id: "all", label: t("tabs.all"), content: <PostsTable trash={false} /> },
          { id: "trash", label: t("tabs.trash"), content: <PostsTable trash /> },
        ]}
      />
    </div>
  );
}

function PostsTable({ trash }: { trash: boolean }) {
  const { t } = useT("posts");
  const { t: tc } = useT("common");
  const { page, setPage } = useTableParams({});
  const posts = usePosts(page, trash);
  const remove = usePostTrashing("delete");
  const restore = usePostTrashing("restore");
  const [pending, setPending] = useState<Post | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption={t("caption")}
        columns={postColumns(t)}
        rows={posts.data?.results}
        getRowId={(post) => post.uuid}
        isError={posts.isError}
        onRetry={() => void posts.refetch()}
        rowActions={(post) => (
          <PostActions
            post={post}
            trash={trash}
            onRemove={setPending}
            onRestore={(row) => restore.mutate(row.uuid)}
          />
        )}
      />
      {posts.data ? (
        <DataTablePagination
          page={page}
          pageSize={POSTS_PAGE_SIZE}
          total={posts.data.count}
          onPageChange={setPage}
        />
      ) : null}
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            remove.reset();
          }
        }}
        title={t("confirm.deleteTitle")}
        description={t("confirm.deleteDescription")}
        confirmLabel={t("confirm.deleteConfirm")}
        variant="destructive"
        isPending={remove.isPending}
        error={remove.isError ? errorText(remove.error, tc) : null}
        onConfirm={() => {
          if (pending) remove.mutate(pending.uuid, { onSuccess: () => setPending(null) });
        }}
      />
    </div>
  );
}
