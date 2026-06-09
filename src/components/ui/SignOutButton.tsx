"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }, [router]);

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-error/40 hover:bg-surface-hover hover:text-error active:scale-[0.97]"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
