import React from 'react';

export const CardSkeleton: React.FC<{ aspect?: string }> = ({ aspect = 'aspect-[2/1]' }) => (
  <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
    <div className={`${aspect} bg-gray-200 dark:bg-gray-700 animate-shimmer`} />
    <div className="p-4 space-y-3">
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

export const TeamCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-shimmer" />
    <div className="p-4 space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

export const ProjectsSkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const TeamSkeletonGrid: React.FC = () => (
  <div className="space-y-10">
    <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <TeamCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div className="text-center py-16 px-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40">
    <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{title}</p>
    {description && (
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{description}</p>
    )}
  </div>
);
