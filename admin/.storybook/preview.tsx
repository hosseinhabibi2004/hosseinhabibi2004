import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/vazirmatn";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { useEffect } from "react";

import { TooltipProvider } from "../src/components/ui/tooltip";
import { I18nProvider } from "../src/i18n/client";
import { getDir, type Language } from "../src/i18n/language";
import resources from "../src/i18n/locales";

import "../src/app/globals.css";

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

/** Sets `lang`, `dir` and the dark class on the page, so the toolbar's choice reaches the whole document. */
function Frame({ language, children }: { language: Language; children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = getDir(language);
    document.documentElement.classList.add("dark");
  }, [language]);
  return <>{children}</>;
}

/** Wraps every story in the providers the app supplies. */
const withApp: Decorator = (Story, context) => {
  const language = (context.globals.language ?? "en") as Language;
  return (
    <Frame language={language}>
      <QueryClientProvider client={client}>
        <I18nProvider language={language} resources={resources}>
          <NuqsTestingAdapter>
            <TooltipProvider>
              <div className="bg-background p-6 text-foreground">
                <Story />
              </div>
            </TooltipProvider>
          </NuqsTestingAdapter>
        </I18nProvider>
      </QueryClientProvider>
    </Frame>
  );
};

const preview: Preview = {
  decorators: [withApp],
  globalTypes: {
    language: {
      description: "Interface language: English reads left to right, Persian right to left",
      toolbar: {
        title: "Language",
        icon: "globe",
        dynamicTitle: true,
        items: [
          { value: "en", title: "English (LTR)" },
          { value: "fa", title: "فارسی (RTL)" },
        ],
      },
    },
  },
  initialGlobals: { language: "en" },
  parameters: {
    layout: "fullscreen",
    backgrounds: { disabled: true },
    nextjs: { appDirectory: true },
    a11y: { test: "todo" },
  },
};

export default preview;
