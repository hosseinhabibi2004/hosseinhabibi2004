"use client";

import { toast } from "sonner";

import { FormErrorAlert } from "@/components/FormErrorAlert";
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
import { cn } from "@/lib/utils";

/**
 * A dialog around one form: title, the fields (`children`), a form-level error
 * that belongs to no field, and a footer with cancel and the submit button that
 * disables while pending. Scrolls inside itself so a long form never runs off a
 * phone screen. The caller owns the `<form>` state — pass `onSubmit`.
 */
export const FormDialog: React.FC<
  React.PropsWithChildren<{
    title: string;
    description?: string;
    submitLabel: string;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
    isPending?: boolean;
    error?: string | null;
    size?: "sm" | "md" | "lg";
    /** A destructive submit (void, reject) wears the danger colour. */
    destructive?: boolean;
  }>
> = ({
  title,
  description,
  submitLabel,
  onSubmit,
  onClose,
  isPending = false,
  error = null,
  size = "md",
  destructive = false,
  children,
}) => {
  const { t } = useT();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-h-[92dvh] overflow-y-auto",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <form
          noValidate
          onSubmit={(event) => {
            // A toast from the previous action must not outlive this attempt (walkthrough 2-4, 3-5).
            toast.dismiss();
            onSubmit(event);
          }} className="flex flex-col gap-5">
          {children}
          {error ? <FormErrorAlert message={error} /> : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {t("cancel")}
            </DialogClose>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={isPending}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
