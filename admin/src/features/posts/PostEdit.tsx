"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { LoadError } from "@/components/LoadError";
import { Skeleton } from "@/components/ui/skeleton";
import { PostForm } from "@/features/posts/PostForm";
import { Author } from "@/sdk/generated";

/** Loads the post named in the URL and hands it to the form. */
export function PostEdit() {
  const { uuid } = useParams<{ uuid: string }>();
  const post = useQuery({
    queryKey: ["posts", "one", uuid],
    queryFn: async () => {
      const { data, error } = await Author.authorPostsRetrieve({ path: { uuid } });
      if (error || !data) throw new Error("post");
      return data.result;
    },
  });

  if (post.isPending) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (post.isError) return <LoadError onRetry={() => void post.refetch()} />;
  return <PostForm post={post.data} />;
}
