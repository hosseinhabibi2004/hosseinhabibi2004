"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

import { useT } from "@/i18n/client"

const Toaster = ({ ...props }: ToasterProps) => {
  const { t } = useT()

  return (
    <Sonner
      theme="dark"
      // Bottom-centre: the sidebar sits on the left in English and on the right in Persian.
      position="bottom-center"
      // On phones the bottom bar owns the lowest edge; lift toasts above it.
      mobileOffset={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))", left: 16, right: 16 }}
      // The region's accessible name: sonner defaults to English plus its Alt+T shortcut hint.
      containerAriaLabel={t("notifications")}
      hotkey={[]}
      duration={3000}
      visibleToasts={2}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Sonner ships its own system-font stack; toasts use the app's.
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
