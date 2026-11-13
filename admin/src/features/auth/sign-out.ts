"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Auth } from "@/sdk/generated";
import { setCsrfToken } from "@/sdk/session";

/** Ends the session, forgets the CSRF token and everything cached, and goes to /login. */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await Auth.authLogout();
    setCsrfToken(null);
    queryClient.clear();
    router.replace("/login");
  };
}
