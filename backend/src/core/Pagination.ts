import { PaginatedResponse, PaginationQuery } from "../models/Pagination";

export function paginate<T>(
  items: T[],
  { page = 1, pageSize = 20 }: PaginationQuery
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedItems = items.slice(start, end);

  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize) || 1,
  };
}
