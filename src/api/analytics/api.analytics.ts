import { useFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import {
  AnalyticsResponse,
  BarChartResponse,
  PieChartResponse,
  ReportResponse,
} from "@/components/interface/analytics/interface.analytics";
import { IResponse } from "@/components/interface/common.interface";
import { queryKeys } from "@/lib/queryKeys";

export const useGetAnalytics = (enabled: boolean) => {
  return useFetch<AnalyticsResponse>(endpoints.ANALYTICS + "/summary", {
    queryKey: queryKeys.analytics.summary(),
    enabled,
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

export const useProfit = (enabled: boolean) => {
  return useFetch<BarChartResponse>(endpoints.ANALYTICS + "/charts/profit", {
    queryKey: queryKeys.analytics.profit(),
    enabled,
  });
};

export const useReport = (
  enabled: boolean,
  filters: Record<string, any> = {},
) => {
  return useFetch<IResponse<ReportResponse>>(endpoints.ANALYTICS + "/report", {
    queryKey: [...queryKeys.analytics.summary(), "report", filters],
    params: { ...filters },
    enabled,
  });
};
