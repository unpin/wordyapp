export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col gap-8 animate-pulse">
      {/* Avatar + name */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-52 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex flex-col gap-1.5">
              <div className="h-7 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Account + subscription sections */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-800">
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
