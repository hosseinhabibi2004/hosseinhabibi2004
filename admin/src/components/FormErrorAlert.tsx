"use client";

import { useEffect, useRef } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/** A form-level error that scrolls itself into view — on a tall sheet it would otherwise appear off-screen. */
export const FormErrorAlert: React.FC<{ message: string }> = ({ message }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [message]);

  return (
    <div ref={ref}>
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
