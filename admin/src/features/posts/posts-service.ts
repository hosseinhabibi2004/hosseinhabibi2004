import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Author } from "@/sdk/generated";

export const POSTS_PAGE_SIZE = 20;

export const postsKey = (page: number, trash: boolean) => ["posts", { page, trash }] as const;

/** One page of posts, or of the Trash. */
export function usePosts(page: number, trash: boolean) {
  return useQuery({
    queryKey: postsKey(page, trash),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await Author.authorPostsList({
        query: { page, page_size: POSTS_PAGE_SIZE, ...(trash ? { deleted: true } : {}) },
      });
      if (error || !data) throw new Error("posts");
      return data.result;
    },
  });
}

/** Moves a post to the Trash, or brings it back; either way every cached list is stale. */
export function usePostTrashing(kind: "delete" | "restore") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const call = kind === "delete" ? Author.authorPostsDestroy : Author.authorPostsRestoreCreate;
      const { error } = await call({ path: { uuid } });
      if (error) throw new Error(kind);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
