"use client";

import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

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
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
