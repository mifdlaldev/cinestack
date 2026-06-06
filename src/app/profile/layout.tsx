import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "View your CineStack profile, watchlist stats, and review history.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
