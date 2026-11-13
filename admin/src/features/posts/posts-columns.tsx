import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { TFunction } from "i18next";

import type { DataTableColumn } from "@/components/data-table/DataTable";
import { IconAction, IconActions } from "@/components/IconAction";
import { StatusBadge } from "@/components/StatusBadge";
import { postTitle } from "@/features/posts/post-title";
import { useT } from "@/i18n/client";
import type { Post } from "@/sdk/generated";

export function postColumns(t: TFunction<"posts">): DataTableColumn<Post>[] {
  return [
    {
      id: "title",
      header: t("columns.title"),
      isTitle: true,
      cell: (post) => postTitle(post, t("untitled")),
    },
    { id: "slug", header: t("columns.slug"), cell: (post) => <bdi dir="ltr">{post.slug}</bdi> },
    {
      id: "languages",
      header: t("columns.languages"),
      cell: (post) => (
        <span className="flex gap-1">
          {(["en", "fa"] as const).map((locale) => (
            <StatusBadge
              key={locale}
              locale={locale}
              status={post.translations.find((row) => row.locale === locale)?.status ?? "empty"}
            />
          ))}
        </span>
      ),
    },
  ];
}

/** Delete for a live post; restore for one in the Trash. */
export function PostActions({
  post,
  trash,
  onRemove,
  onRestore,
}: {
  post: Post;
  trash: boolean;
  onRemove: (post: Post) => void;
  onRestore: (post: Post) => void;
}) {
  const { t } = useT("posts");
  return (
    <IconActions>
      {trash ? (
        <IconAction label={t("actions.restore")} icon={RotateCcw} onClick={() => onRestore(post)} />
      ) : (
        <>
          <IconAction label={t("actions.edit")} icon={Pencil} href={`/posts/${post.uuid}`} />
          <IconAction label={t("actions.delete")} icon={Trash2} tone="danger" onClick={() => onRemove(post)} />
        </>
      )}
    </IconActions>
  );
}
