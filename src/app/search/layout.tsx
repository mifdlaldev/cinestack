import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Movies",
  description:
    "Search through thousands of movies to find your next favorite film. Filter by title, genre, and more.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
