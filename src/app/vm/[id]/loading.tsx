import { Navbar } from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar showBackButton />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-200 dark:bg-slate-700 rounded-xl w-14 h-14" />
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20" />
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-36" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                <div className="p-2 bg-gray-200 dark:bg-slate-700 rounded-lg w-9 h-9" />
              </div>
              <div className="mt-3">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20 mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Details Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Configuration Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Hardware Resources Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Network Interfaces Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Storage Devices Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 lg:col-span-2 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-200 dark:bg-slate-700 rounded-lg w-9 h-9" />
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 mt-1" />
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-40" />
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 