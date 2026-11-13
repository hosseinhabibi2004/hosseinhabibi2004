"use client";

import { parseAsString, useQueryState } from "nuqs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface UrlTabSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * A tab strip whose choice lives in the URL (`tab`), so a link opens the same tab.
 * Only the open tab's content is mounted, so a section fetches when it is looked at.
 * The page decides which sections exist and in what order.
 */
export const UrlTabs: React.FC<{
  sections: readonly UrlTabSection[];
  label: string;
}> = ({ sections, label }) => {
  const [tab, setTab] = useQueryState("tab", parseAsString);
  const current = sections.find((section) => section.id === tab) ?? sections[0];
  // A page may filter every section away by permission; there is nothing to draw.
  if (!current) return null;

  return (
    <Tabs value={current.id} onValueChange={(next) => void setTab(String(next))}>
      {/* On a phone the tabs wrap onto a second row rather than hide one behind a scroll. */}
      <TabsList
        aria-label={label}
        className="justify-start max-sm:h-auto! max-sm:flex-wrap max-sm:gap-1 max-sm:overflow-visible max-sm:*:h-8!"
      >
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={current.id}>{current.content}</TabsContent>
    </Tabs>
  );
};
