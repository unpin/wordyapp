import ResetPasswordForm from "@/components/form/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Set new password</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Choose a strong password for your account
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
