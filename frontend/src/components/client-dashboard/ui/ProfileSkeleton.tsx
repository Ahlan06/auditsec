import SkeletonBlock from './SkeletonBlock';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-2">
              <SkeletonBlock className="h-4 w-80" />
            </div>
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="apple-card">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <SkeletonBlock className="h-3 w-24" />
              <div className="mt-2">
                <SkeletonBlock className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <SkeletonBlock className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
