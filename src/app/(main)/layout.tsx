import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "../../components/layout/Header";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: LayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <Header />
      {children}
    </div>
  );
}
