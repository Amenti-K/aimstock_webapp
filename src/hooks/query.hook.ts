import {
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import AxiosInstance from "@/lib/axiosInstance";

/** Options for mutation hooks */
interface UseMutateOptions<TData> {
  queryKey?: any[] | readonly any[];
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
  headers?: Record<string, string>;
}

/** Options for fetch hooks */
interface UseFetchOptions<TData> {
  queryKey?: any[] | readonly any[];
  enabled?: boolean; // control automatic fetching
  headers?: Record<string, string>;
  staleTime?: number; // cache duration
  params?: Record<string, any>;
}

/**
 * Universal mutate hook for POST, PUT, PATCH, DELETE requests.
 * @example const { mutate, isPending } = useMutate('/auth/login', 'post', { onSuccess, onError });
 */
export const useMutate = <TData = any>(
  urlOrFn: string | ((payload: TData) => string),
  method: AxiosRequestConfig["method"],
  options?: UseMutateOptions<TData>,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: TData) => {
      const url = typeof urlOrFn === "function" ? urlOrFn(payload) : urlOrFn;
      const res: AxiosResponse = await AxiosInstance({
        url,
        method,
        data: payload,
        headers: {
          ...(options?.headers || {}),
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (options?.queryKey)
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });

  return mutation;
};

/**
 * Universal fetch hook for GET requests.
 * @example const { data, isLoading } = useFetch('/accounts', { queryKey: ['accounts'] });
 */
export const useFetch = <TData = any>(
  urlOrFn: string | (() => string),
  options?: UseFetchOptions<TData>,
) => {
  const queryClient = useQueryClient();
  const queryKey = options?.queryKey || [urlOrFn];

  const query = useQuery<TData>({
    queryKey,
    queryFn: async () => {
      const url = typeof urlOrFn === "function" ? urlOrFn() : urlOrFn;
      const res: AxiosResponse = await AxiosInstance({
        url,
        method: "get",
        params: options?.params,
        headers: {
          ...(options?.headers || {}),
        },
      });
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60, // 1 minute by default
  });

  return { ...query, queryClient };
};

/**
 * Universal infinite fetch hook for GET requests with pagination.
 * @example const { data, fetchNextPage, hasNextPage } = useInfiniteFetch('/purchases', { queryKey: ['purchases'] });
 */
export const useInfiniteFetch = <TData = any>(
  urlOrFn: string | (() => string),
  options?: UseFetchOptions<TData>,
) => {
  const queryClient = useQueryClient();
  const queryKey = options?.queryKey || [urlOrFn];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const url = typeof urlOrFn === "function" ? urlOrFn() : urlOrFn;
      const res: AxiosResponse = await AxiosInstance({
        url,
        method: "get",
        params: {
          ...options?.params,
          page: pageParam,
          limit: options?.params?.limit || 10,
        },
        headers: {
          ...(options?.headers || {}),
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage?.meta;
      if (meta?.hasNextPage) {
        return meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60, // 1 minute by default
  });

  return { ...query, queryClient };
};
