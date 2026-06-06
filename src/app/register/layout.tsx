import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join CineStack to discover, review, and track your favorite movies.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
