import { redirect } from "next/navigation";
import DeleteAccountButton from "@/components/features/DeleteAccountButton";
import SettingsForm from "@/components/features/SettingsForm";
import ChangePasswordForm from "@/components/form/ChangePasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "";

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-500 mt-1 text-sm">
          Manage your account details
        </p>
      </div>

      <Section title="Profile" description="Update your name and email address">
        <SettingsForm initialName={name} initialEmail={user.email ?? ""} />
      </Section>

      <Section title="Password" description="Change your password">
        <ChangePasswordForm email={user.email ?? ""} />
      </Section>

      <Section
        title="Danger zone"
        description="Irreversible account actions"
        danger
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Permanently delete your account and all data. This cannot be
              undone.
            </p>
          </div>
          <DeleteAccountButton email={user.email ?? ""} />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded-xl overflow-hidden ${danger ? "border-red-900" : "border-gray-200 dark:border-gray-800"}`}
    >
      <div
        className={`px-6 py-4 border-b ${danger ? "border-red-900" : "border-gray-200 dark:border-gray-800"}`}
      >
        <h2
          className={`text-sm font-semibold ${danger ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
        >
          {title}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
