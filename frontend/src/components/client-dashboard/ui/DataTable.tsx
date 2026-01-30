import { useEffect, useMemo, useState } from 'react';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  widthClassName?: string;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number | boolean | null | undefined;
};

export type DataTableProps<T> = {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyText?: string;
};

type SortDir = 'asc' | 'desc';

const toStringSafe = (v: unknown) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
};

const escapeCsv = (value: string) => {
  const needs = /[\n\r,\"]/g.test(value);
  const escaped = value.replace(/\"/g, '""');
  return needs ? `"${escaped}"` : escaped;
};

function downloadBlob(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  emptyText = 'No data',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filterableKeys = useMemo(() => columns.filter((c) => c.filterable).map((c) => c.key), [columns]);

  const filtered = useMemo(() => {
    if (!filterableKeys.length) return rows;

    return rows.filter((row) => {
      for (const key of filterableKeys) {
        const q = (filters[key] || '').trim().toLowerCase();
        if (!q) continue;
        const col = columns.find((c) => c.key === key);
        const raw = col?.value ? col.value(row) : (row as any)?.[key];
        const text = toStringSafe(raw).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, filterableKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;

    const getVal = (row: T) => {
      const v = col.value ? col.value(row) : (row as any)?.[sortKey];
      return v;
    };

    const dir = sortDir === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      const as = toStringSafe(av).toLowerCase();
      const bs = toStringSafe(bv).toLowerCase();
      if (as < bs) return -1 * dir;
      if (as > bs) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sorted.length / pageSize)), [sorted.length, pageSize]);

  const currentPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const allSelectedOnPage = useMemo(() => {
    return currentPageRows.length > 0 && currentPageRows.every((r) => selected[getRowId(r)]);
  }, [currentPageRows, selected, getRowId]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const toggleSort = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;

    setPage(1);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  };

  const toggleAllOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const r of currentPageRows) next[getRowId(r)] = checked;
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const exportJson = () => {
    const dataset = selectedIds.length
      ? sorted.filter((r) => selected[getRowId(r)])
      : sorted;
    downloadBlob('export.json', 'application/json', JSON.stringify(dataset, null, 2));
  };

  const exportCsv = () => {
    const dataset = selectedIds.length
      ? sorted.filter((r) => selected[getRowId(r)])
      : sorted;

    const headers = columns.map((c) => c.header);
    const lines = [headers.map(escapeCsv).join(',')];

    for (const row of dataset) {
      const values = columns.map((c) => {
        const raw = c.value ? c.value(row) : (row as any)?.[c.key];
        return escapeCsv(toStringSafe(raw));
      });
      lines.push(values.join(','));
    }

    downloadBlob('export.csv', 'text/csv', lines.join('\n'));
  };

  // keep page in range
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="apple-card p-0 overflow-hidden">
      <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Table</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Export JSON
          </button>
          {selectedIds.length ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedIds.length}</span>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">Rows: {sorted.length}</span>
          )}
        </div>
      </div>

      {filterableKeys.length ? (
        <div className="px-5 pb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {columns
            .filter((c) => c.filterable)
            .map((c) => (
              <div key={c.key}>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Filter {c.header}</div>
                <input
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-xs"
                  value={filters[c.key] || ''}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((prev) => ({ ...prev, [c.key]: e.target.value }));
                  }}
                  placeholder="Type to filter…"
                />
              </div>
            ))}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={(e) => toggleAllOnPage(e.target.checked)}
                  aria-label="Select all rows on this page"
                />
              </th>
              {columns.map((c) => {
                const isSorted = sortKey === c.key;
                const canSort = Boolean(c.sortable);
                return (
                  <th
                    key={c.key}
                    className={(c.widthClassName || '') + ' px-4 py-3 text-left font-medium ' + (canSort ? 'cursor-pointer select-none' : '')}
                    onClick={() => toggleSort(c.key)}
                    title={canSort ? 'Click to sort' : undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>{c.header}</span>
                      {isSorted ? <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {currentPageRows.map((r) => {
              const id = getRowId(r);
              return (
                <tr key={id} className="bg-white dark:bg-black">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[id])}
                      onChange={(e) => toggleRow(id, e.target.checked)}
                      aria-label="Select row"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {c.render ? c.render(r) : toStringSafe(c.value ? c.value(r) : (r as any)?.[c.key]) || '—'}
                    </td>
                  ))}
                </tr>
              );
            })}

            {currentPageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            First
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Last
          </button>

          <select
            className="ml-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-xs"
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
