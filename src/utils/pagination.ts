export interface Pagination<T> {
  data: T[];
  pageSize: number;
  pageNumber: number;
  next: string;
  previous: string;
}

export default function paginate<T>(documents: T[], pageSize: number, pageNumber: number, path: string ): Pagination<T> {
  return {
    data: documents,
    pageSize,
    pageNumber,
    next: documents.length < pageSize ? '' : `${process.env.BASE_URL}${path}?page=${pageNumber + 1}`,
    previous: (pageNumber > 1) ? `${process.env.BASE_URL}${path}?page=${pageNumber - 1}` : ''
  };
}
