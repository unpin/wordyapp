export default function Loading() {
  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4 flex flex-col gap-8 animate-pulse">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* Selection list */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-1" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded shrink-0" />
          </div>
        ))}
      </div>

      {/* Start button */}
      <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}
