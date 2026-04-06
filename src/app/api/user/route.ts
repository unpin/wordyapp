import { createClient as createAdminClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { message: "Name and email are required" },
      { status: 400 },
    );
  }

  const { error } = await supabase.auth.updateUser({
    email: email.trim().toLowerCase(),
    data: { name: name.trim() },
  });

  if (error) {
    if (error.code === "email_exists") {
      return NextResponse.json(
        { message: "That email is already in use" },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
