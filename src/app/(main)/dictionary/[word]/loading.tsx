export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto my-4 animate-pulse">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-6">
          <div className="border-l-3 border-l-purple-400 pl-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            </div>

            <ul className="mt-3 space-y-2">
              <li className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
            </ul>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-4/6 flex flex-col gap-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center gap-2">
                  <div className="h-5 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="h-5 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                </div>

                <hr className="border-t border-gray-200 dark:border-gray-800" />

                <div className="flex flex-col gap-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>

            <div className="lg:w-2/6 flex flex-col gap-6">
              <div className="flex flex-col gap-6 border border-gray-200 dark:border-gray-800 rounded-md p-6">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <hr className="border-t border-gray-200 dark:border-gray-800 w-full" />
                <div className="flex flex-wrap gap-4">
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
                </div>
              </div>

              <div className="flex flex-col gap-6 border border-gray-200 dark:border-gray-800 rounded-md p-6">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <hr className="border-t border-gray-200 dark:border-gray-800 w-full" />
                <div className="flex flex-wrap gap-4">
                  <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
