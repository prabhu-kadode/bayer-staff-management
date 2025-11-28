
interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export { PaginationQuery, PaginatedResponse };