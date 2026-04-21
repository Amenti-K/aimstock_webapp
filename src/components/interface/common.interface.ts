export interface IResponse<T> {
  msg: string;
  data: T;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IPaginatedResponse<T> extends IResponse<T[]> {
  meta: IPaginationMeta;
}

export type ISingleResponse<T> = IResponse<T>;

export interface IPagination {
  page?: number;
  limit?: number;
}
