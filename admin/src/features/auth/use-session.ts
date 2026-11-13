"use client";

import { useQuery } from "@tanstack/react-query";

import { Auth } from "@/sdk/generated";
import type { User } from "@/sdk/generated";

export const SESSION_KEY = ["session"] as const;

export type Session =
  | { status: "loading"; user: null }
  | { status: "signed-in"; user: User }
  | { status: "signed-out"; user: null };

/** Who is signed in, asked of the API: the session cookie is the only state. */
export function useSession(): Session {
  const query = useQuery({
    queryKey: SESSION_KEY,
    staleTime: 60_000,
    queryFn: async (): Promise<User | null> => {
      const { data } = await Auth.authMe();
      return data?.result ?? null;
    },
  });

  if (query.isPending) return { status: "loading", user: null };
  return query.data ? { status: "signed-in", user: query.data } : { status: "signed-out", user: null };
}
