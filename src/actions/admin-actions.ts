// ─────────────────────────────────────────────────────────────
// Admin Server Actions
// ─────────────────────────────────────────────────────────────

"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function adminDeleteUser(userId: string): Promise<{
  error?: string;
  success?: boolean;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin privileges required" };
  }

  try {
    const { error } = await supabase.rpc("admin_delete_user", {
      target_user_id: userId,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete user",
    };
  }
}
