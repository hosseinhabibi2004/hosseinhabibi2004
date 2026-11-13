"use client";

import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";

/** A failed fetch, said once and with a way to try again. */
export const LoadError: React.FC<{
  /** What failed to load; defaults to a generic sentence. */
  message?: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => {
  const { t } = useT();

  return (
    <Alert variant="destructive" className="gap-y-2 py-3">
      <CircleAlert aria-hidden />
      <AlertTitle>{message ?? t("errors.loadFailed")}</AlertTitle>
      {onRetry ? (
        <AlertDescription className="mt-1">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("retry")}
          </Button>
        </AlertDescription>
      ) : null}
    </Alert>
  );
};
