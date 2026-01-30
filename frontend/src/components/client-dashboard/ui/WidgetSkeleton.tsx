import SkeletonBlock from './SkeletonBlock';

export type WidgetSkeletonProps = {
  lines?: number;
};

export default function WidgetSkeleton({ lines = 3 }: WidgetSkeletonProps) {
  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <SkeletonBlock className="h-9 w-9 rounded-xl" />
      </div>

      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock key={i} className={i === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
        ))}
      </div>
    </div>
  );
}
