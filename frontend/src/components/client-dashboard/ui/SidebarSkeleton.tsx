import SkeletonBlock from './SkeletonBlock';

export default function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 w-9 rounded-lg" />
          <div>
            <SkeletonBlock className="h-3 w-24" />
            <div className="mt-2">
              <SkeletonBlock className="h-3 w-16" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-lg md:hidden" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {Array.from({ length: 3 }).map((_, s) => (
          <div key={s}>
            <div className="px-3 pb-2">
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((__, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-4 w-4 rounded" />
                    <SkeletonBlock className="h-3 w-28" />
                  </div>
                  <SkeletonBlock className="h-4 w-10 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <SkeletonBlock className="h-3 w-28" />
            <div className="mt-2">
              <SkeletonBlock className="h-3 w-40" />
            </div>
          </div>
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
