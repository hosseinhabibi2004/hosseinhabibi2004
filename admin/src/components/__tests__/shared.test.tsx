import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { StatGrid, StatTile } from "@/components/StatGrid";
import { renderWithProviders } from "@/i18n/test-utils";

interface Row {
  id: string;
  name: string;
}
const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", isTitle: true, cell: (row) => row.name },
];
const ROWS: Row[] = [
  { id: "1", name: "Sara" },
  { id: "2", name: "Ali" },
];

function stubViewport(isDesktop: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: isDesktop,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}
afterEach(() => vi.unstubAllGlobals());

describe("DataTable", () => {
  it("renders a labelled table on a wide screen and cards on a phone", () => {
    stubViewport(true);
    const { unmount } = renderWithProviders(
      <DataTable caption="Posts" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />,
    );
    const table = screen.getByRole("table", { name: "Posts" });
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    unmount();

    stubViewport(false);
    renderWithProviders(<DataTable caption="Posts" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows loading, empty and error-with-retry states", async () => {
    stubViewport(true);
    const onRetry = vi.fn();
    const { rerender } = renderWithProviders(
      <DataTable caption="Posts" columns={COLUMNS} rows={undefined} getRowId={(r) => r.id} />,
    );
    expect(screen.getByRole("status", { name: "Loading…" })).toBeInTheDocument();

    rerender(<DataTable caption="Posts" columns={COLUMNS} rows={[]} getRowId={(r) => r.id} />);
    expect(screen.getByText("Nothing found.")).toBeInTheDocument();

    rerender(
      <DataTable caption="Posts" columns={COLUMNS} rows={undefined} isError onRetry={onRetry} getRowId={(r) => r.id} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("DataTablePagination", () => {
  it("counts pages in English and disables the ends", async () => {
    const onPageChange = vi.fn();
    renderWithProviders(<DataTablePagination page={1} pageSize={20} total={45} onPageChange={onPageChange} />);

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("45 items")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("counts pages with Persian digits in Persian", () => {
    renderWithProviders(<DataTablePagination page={1} pageSize={20} total={45} onPageChange={vi.fn()} />, {
      language: "fa",
    });

    expect(screen.getByText("صفحه ۱ از ۳")).toBeInTheDocument();
    expect(screen.getByText("۴۵ مورد")).toBeInTheDocument();
  });
});

describe("StatGrid", () => {
  it.each([
    [1, "md:grid-cols-1"],
    [3, "md:grid-cols-3"],
    [6, "md:grid-cols-3"],
    [8, "md:grid-cols-4"],
  ])("takes the columns that leave no empty cell for %i tiles", (count, expected) => {
    const { container } = render(
      <StatGrid count={count}>
        {Array.from({ length: count }, (_, i) => (
          <StatTile key={i} label={`Label ${i}`} value={i} />
        ))}
      </StatGrid>,
    );
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("makes a tile with an href a link over the whole tile", () => {
    render(
      <StatGrid>
        <StatTile label="Posts" value="12" href="/posts" />
        <StatTile label="Projects" value="4" />
      </StatGrid>,
    );
    expect(screen.getByRole("link", { name: /Posts/ })).toHaveAttribute("href", "/posts");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("ConfirmDialog", () => {
  it("confirms with the caller's label and cancels without confirming", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete this post?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={onConfirm}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Delete this post?" });

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
