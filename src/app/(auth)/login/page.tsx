import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/form/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Welcome back to Wordy
          </p>
        </div>

        <LoginForm />

        <p className="text-sm text-gray-600 dark:text-gray-500 text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-500 hover:text-blue-400 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
