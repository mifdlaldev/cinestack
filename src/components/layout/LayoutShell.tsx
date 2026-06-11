"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/layout/Navbar").then((m) => m.Navbar), {
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => m.Footer));

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
