import type { ReactNode } from "react";

interface DataCardProps {
  title: string;
  count?: number;
  isLoading?: boolean;
  error?: Error | null;
  children?: ReactNode;
  icon?: ReactNode;
}

export function DataCard({ 
  title, 
  count, 
  isLoading, 
  error, 
  children,
  icon 
}: DataCardProps) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-gray-400">{icon}</div>}
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {title}
            </h3>
          </div>
          {isLoading && (
            <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
          )}
          {!isLoading && count !== undefined && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-600">
            Error loading data: {error.message}
          </p>
        )}
        {!isLoading && !error && children}
        {!isLoading && !error && !children && (
          <p className="text-sm text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
}