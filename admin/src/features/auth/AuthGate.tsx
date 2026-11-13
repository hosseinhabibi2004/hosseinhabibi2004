"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/features/auth/use-session";

/** Shows its children only to a signed-in author; anyone else goes to /login. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "signed-out") router.replace("/login");
  }, [session.status, router]);

  return session.status === "signed-in" ? <>{children}</> : null;
}
