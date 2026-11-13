"use client";

import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/auth/use-session";
import { useSignOut } from "@/features/auth/sign-out";
import { useT } from "@/i18n/client";
import { isolateLtr } from "@/lib/format";

/** The signed-in author's name and the way out. */
export function ShellUserMenu() {
  const { t } = useT("shell");
  const { user } = useSession();
  const signOut = useSignOut();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("userMenu")} />}
      >
        <User aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{isolateLtr(user.username)}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut aria-hidden />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
