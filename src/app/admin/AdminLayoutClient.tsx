"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh]">
      <AdminSidebar mobileOpen={sidebarOpen} onMobileOpenChange={setSidebarOpen} />

      <main className="flex-1 overflow-x-auto bg-bg lg:pt-8">
        {/* Fixed top bar — mobile & tablet */}
        <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-end gap-3 glass-nav px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center text-text-secondary transition-colors hover:text-text"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="px-4 pb-12 pt-16 md:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
