import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Link expired</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            This confirmation link is invalid or has already been used.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 transition rounded-lg text-sm font-medium text-center"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition rounded-lg text-sm font-medium text-center text-gray-600 dark:text-gray-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
