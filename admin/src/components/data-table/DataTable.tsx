"use client";

import { SearchX } from "lucide-react";
import { Fragment } from "react";

import { EmptyState } from "@/components/EmptyState";
import { LoadError } from "@/components/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useT } from "@/i18n/client";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

export interface DataTableColumn<TRow> {
  id: string;
  header: string;
  cell: (row: TRow) => React.ReactNode;
  /** On a phone this column's cell is the card's heading instead of a labelled line. */
  isTitle?: boolean;
  className?: string;
}

interface DataTableProps<TRow> {
  /** Names the table for assistive tech ("List of posts"). */
  caption: string;
  columns: readonly DataTableColumn<TRow>[];
  /** `undefined` while the first page is loading. */
  rows: readonly TRow[] | undefined;
  getRowId: (row: TRow) => string;
  isError?: boolean;
  onRetry?: () => void;
  /** The empty-list message; the default says nothing matched. */
  empty?: React.ReactNode;
  /** The row's actions (icon buttons), at the row's end / the card's corner. */
  rowActions?: (row: TRow) => React.ReactNode;
  skeletonRows?: number;
  /**
   * A row that opens in place (an audit entry's diff). The row stays in the
   * table; its detail renders under it — full width in the table, below the
   * card's fields on a phone. Opening/closing is the caller's.
   */
  expansion?: {
    isExpanded: (row: TRow) => boolean;
    render: (row: TRow) => React.ReactNode;
  };
}

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * The list pattern every admin screen uses: a table from `md` up, a stack of
 * cards on a phone (a seven-column table is unreadable at 360px). Owns the
 * loading skeleton, the error with retry and the empty state, so a screen
 * only supplies columns and rows.
 */
export function DataTable<TRow>({
  caption,
  columns,
  rows,
  getRowId,
  isError = false,
  onRetry,
  empty,
  rowActions,
  skeletonRows = 6,
  expansion,
}: DataTableProps<TRow>) {
  const { t } = useT();
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);

  if (isError)
    return <LoadError message={t("table.loadFailed")} onRetry={onRetry} />;
  if (rows === undefined) {
    return <DataTableSkeleton rows={skeletonRows} compact={!isDesktop} />;
  }
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent>
          {empty ?? <EmptyState icon={SearchX} title={t("table.empty")} />}
        </CardContent>
      </Card>
    );
  }

  if (!isDesktop) {
    return (
      <ul aria-label={caption} className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={getRowId(row)}>
            <DataCard
              row={row}
              columns={columns}
              rowActions={rowActions}
              expanded={
                expansion?.isExpanded(row) ? expansion.render(row) : null
              }
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table aria-label={caption}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {rowActions ? (
              <TableHead className="w-0">
                <span className="sr-only">{t("table.rowActions")}</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Fragment key={getRowId(row)}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {rowActions ? <TableCell>{rowActions(row)}</TableCell> : null}
              </TableRow>
              {expansion?.isExpanded(row) ? (
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell
                    colSpan={columns.length + (rowActions ? 1 : 0)}
                    className="whitespace-normal"
                  >
                    {expansion.render(row)}
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function DataCard<TRow>({
  row,
  columns,
  rowActions,
  expanded,
}: {
  row: TRow;
  columns: readonly DataTableColumn<TRow>[];
  rowActions?: (row: TRow) => React.ReactNode;
  expanded: React.ReactNode;
}) {
  const title = columns.find((column) => column.isTitle) ?? columns[0];
  const rest = columns.filter((column) => column !== title);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 text-sm font-bold">{title.cell(row)}</div>
          {rowActions ? (
            <div className="shrink-0">{rowActions(row)}</div>
          ) : null}
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          {rest.map((column) => (
            <div
              key={column.id}
              className={cn(
                "flex items-start justify-between gap-3",
                column.className,
              )}
            >
              <dt className="shrink-0 text-muted-foreground">
                {column.header}
              </dt>
              <dd className="min-w-0 text-end">{column.cell(row)}</dd>
            </div>
          ))}
        </dl>
        {expanded}
      </CardContent>
    </Card>
  );
}

function DataTableSkeleton({
  rows,
  compact,
}: {
  rows: number;
  compact: boolean;
}) {
  const { t } = useT();

  return (
    <div
      role="status"
      aria-label={t("loading")}
      className="flex flex-col gap-2"
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={compact ? "h-24" : "h-12"} />
      ))}
    </div>
  );
}
