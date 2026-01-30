import type { CSSProperties } from 'react';

export type SkeletonBlockProps = {
  className?: string;
  style?: CSSProperties;
};

export default function SkeletonBlock({ className = '', style }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} style={style} />;
}
