import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(collections)
      .values({
        name: name.trim(),
        description: description?.trim() ?? "",
        ownerId: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create collection", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
