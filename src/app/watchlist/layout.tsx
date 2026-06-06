import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist",
  description:
    "Your personal movie watchlist. Save movies you want to watch and keep track of what you've seen.",
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
