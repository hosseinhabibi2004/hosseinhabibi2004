"use client";

import { FormErrorAlert } from "@/components/FormErrorAlert";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n/client";

/**
 * The confirmation every destructive admin action goes through.
 *
 * `confirmLabel` is the caller's, and should name what will happen — "Delete",
 * "Reject" — rather than "OK", so the button and the sentence above it agree.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending = false,
  variant = "default",
  error = null,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isPending?: boolean;
  variant?: "default" | "destructive";
  /** Why the action was refused, shown in the dialog so the choice stays in view. */
  error?: string | null;
  onConfirm: () => void;
}) {
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {error ? <FormErrorAlert message={error} /> : null}
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>
            {t("cancel")}
          </DialogClose>
          <Button variant={variant} disabled={isPending} onClick={() => {
              toast.dismiss(); // the previous action's toast must not outlive this one
              onConfirm();
            }}>
            {confirmLabel ?? t("yes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
