"use client";

import { useRouter } from "next/navigation";
import { MoviePagination } from "@/components/ui/MoviePagination";

interface GenrePaginationProps {
  currentPage: number;
  totalPages: number;
  genreId: number;
}

export function GenrePagination({
  currentPage,
  totalPages,
  genreId,
}: GenrePaginationProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/genre/${genreId}?page=${page}`);
  };

  return (
    <MoviePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
