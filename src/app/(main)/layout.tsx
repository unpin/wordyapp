import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "../../components/layout/BottomNav";
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
    <div className="p-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-4 bg-white dark:bg-gray-900">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}
