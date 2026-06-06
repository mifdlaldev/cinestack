import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Movies",
  description:
    "Discover new movies by genre, year, popularity, and more. Find your next watch with CineStack.",
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
