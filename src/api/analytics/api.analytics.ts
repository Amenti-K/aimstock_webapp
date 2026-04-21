import { useFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import {
  AnalyticsResponse,
  BarChartResponse,
  PieChartResponse,
} from "@/components/interface/analytics/interface.analytics";
import { IResponse } from "@/components/interface/common.interface";
import { queryKeys } from "@/constants/queryKeys";

export const useGetAnalytics = (options?: { enabled?: boolean }) => {
  return useFetch<AnalyticsResponse>(endpoints.ANALYTICS + "/summary", {
    queryKey: queryKeys.analytics.summary(),
    enabled: options?.enabled ?? true,
  });
};

export const usePieChart = (
  enabled: boolean,
  filters: Record<string, any> = {},
) => {
  return useFetch<PieChartResponse>(endpoints.ANALYTICS + "/charts/pie", {
    queryKey: queryKeys.analytics.pieChart(filters),
    params: { ...filters },
    enabled,
  });
};

export const useProfit = (options?: { enabled?: boolean }) => {
  return useFetch<BarChartResponse>(endpoints.ANALYTICS + "/charts/profit", {
    queryKey: queryKeys.analytics.profit(),
    enabled: options?.enabled ?? true,
  });
};
