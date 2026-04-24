export interface AnalyticsSummary {
  totalInventoryValue: number;
  lowestStock: { inventory: string; quantity: number };
}

export interface ChartPoint {
  inventory?: string;
  warehouseId?: string;
  month?: string;
  quantity?: number;
  totalValue?: number;
  totalQty?: number;
  value?: number;
}

export interface AnalyticsCharts {
  topSellingItems: ChartPoint[];
  stockByWarehouse: ChartPoint[];
  salesTrend: ChartPoint[];
  purchaseTrend: ChartPoint[];
  lowStockItems: ChartPoint[];
  inventoryValueDistribution: ChartPoint[];
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
}

export interface SinglePieChart {
  label: string;
  value: number;
}

export interface PieChartResponse {
  bestSelling: { inventory: string; quantity: number };
  mostUnsold: { inventory: string; quantity: number };
  totalProfit: number;
  totalRevenue: number;
  totalPurchaseValue: number;
  netCashFlow: number;
  totalQtySold: number;
  transactionCount: number;
  chartData: SinglePieChart[];
}

export interface SingleBarChart {
  month: string;
  sales: number;
  purchase: number;
  profit: number;
}

export interface BarChartResponse {
  chartData: SingleBarChart[];
}
