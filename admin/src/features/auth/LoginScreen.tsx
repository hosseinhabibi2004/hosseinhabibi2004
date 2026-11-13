"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SESSION_KEY } from "@/features/auth/use-session";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/api-errors";
import { Auth } from "@/sdk/generated";
import { loadCsrfToken, setCsrfToken } from "@/sdk/session";

/** The sign-in form: CSRF handshake, login, then the new token is kept for later writes. */
export function LoginScreen() {
  const { t } = useT("auth");
  const { t: tc } = useT("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await loadCsrfToken();
      const result = await Auth.authLogin({ body: { username, password } });
      if (result.error || !result.data) {
        setError(
          result.response?.status === 401
            ? tc("errors.invalidCredentials")
            : errorText(result.error, tc),
        );
        return;
      }
      setCsrfToken(result.data.result.csrf_token);
      queryClient.setQueryData(SESSION_KEY, result.data.result.user);
      router.replace("/");
    } catch {
      setError(tc("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {error ? <FormErrorAlert message={error} /> : null}
        <Field>
          <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            dir="ltr"
            className="text-start"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className="text-start"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? t("signingIn") : t("submit")}
        </Button>
      </form>
    </main>
  );
}
