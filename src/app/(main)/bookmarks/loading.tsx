export default function Loading() {
  return (
    <div className="my-6 sm:my-8 mx-auto max-w-7xl flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 items-start animate-pulse">
      {/* Review progress sidebar */}
      <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>

      <div className="w-full">
        {/* Collections header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Collection cards */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="h-6 w-3/5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="flex items-center justify-between mt-1">
                <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </li>
          ))}
        </ul>

        {/* Bookmarks header */}
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-10 mb-6" />

        {/* Bookmark rows */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
