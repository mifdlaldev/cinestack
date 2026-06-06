// ─────────────────────────────────────────────────────────────
// Admin Layout — Sidebar navigation + server-side admin guard
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[100dvh]">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto bg-bg px-4 pb-12 pt-6 md:px-6 md:pt-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
