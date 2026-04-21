"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChartResponse } from "@/components/interface/analytics/interface.analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PerformanceChartProps {
  data: PieChartResponse | null | undefined;
}

const COLORS = ["#2E7D32", "#4CAF50", "#8BC34A", "#CDDC39", "#FF9800"];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data || !data.chartData || data.chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No performance data available
      </div>
    );
  }

  // Ensure we only show top 4 + others if needed, but data is likely already processed
  const chartData = data.chartData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            nameKey="label"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: any, entry: any) => (
              <span className="text-xs font-medium text-muted-foreground">
                {value}: {entry.payload.value}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
