"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { formatNumber, localizeDigits } from "@/lib/format";

/** Previous / next with "Page 2 of 5" and the total, for a server-paginated list. */
export const DataTablePagination: React.FC<{
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}> = ({ page, pageSize, total, onPageChange }) => {
  const { t, i18n } = useT();
  const language = i18n.language;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {t("table.resultCount", { formattedCount: formatNumber(total, language) })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("table.previousPage")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" aria-hidden />
        </Button>
        <span aria-live="polite">
          {t("table.pageOf", {
            page: localizeDigits(page, language),
            total: localizeDigits(pageCount, language),
          })}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("table.nextPage")}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    </div>
  );
};
