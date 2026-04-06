import Link from "next/link";

type ReviewProgressProps = {
  reviewed: number;
  total: number;
};

export default function ReviewProgress({
  reviewed,
  total,
}: ReviewProgressProps) {
  const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const remaining = total - reviewed;

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
        Review Progress
      </p>

      {/* Ring + percentage side by side */}
      <div className="flex items-center gap-5">
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-200 dark:text-gray-800"
            />
            {/* Progress arc */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
              className="text-blue-500"
            />
          </svg>
          <div className="flex flex-col items-center leading-tight">
            <span className="text-xl font-bold tabular-nums">{reviewed}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              of {total}
            </span>
          </div>
        </div>

        <div>
          <p className="text-3xl font-bold tabular-nums">{percentage}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-0.5">
            reviewed
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {total === 0
            ? "No words yet"
            : remaining === 0
              ? "All words reviewed!"
              : `${remaining} word${remaining === 1 ? "" : "s"} left`}
        </p>
      </div>

      {total > 0 && (
        <Link
          href="/practice"
          className="text-sm font-medium text-blue-500 hover:text-blue-400 transition"
        >
          Practice now →
        </Link>
      )}
    </div>
  );
}
