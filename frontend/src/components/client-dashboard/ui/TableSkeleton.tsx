import SkeletonBlock from './SkeletonBlock';

export type TableSkeletonProps = {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
};

export default function TableSkeleton({ columns = 6, rows = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="apple-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {showHeader ? (
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                {Array.from({ length: columns }).map((_, idx) => (
                  <th key={idx} className="px-4 py-3 text-left">
                    <SkeletonBlock className="h-3 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="bg-white dark:bg-black">
                {Array.from({ length: columns }).map((__, c) => (
                  <td key={c} className="px-4 py-3">
                    <SkeletonBlock className={c === 0 ? 'h-4 w-56' : 'h-4 w-24'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
