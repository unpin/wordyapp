import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignUpPageClient from "./SignUpPageClient";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return <SignUpPageClient />;
}
