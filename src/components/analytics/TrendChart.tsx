"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChartResponse } from "@/components/interface/analytics/interface.analytics";

interface TrendChartProps {
  data: BarChartResponse | null | undefined;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || !data.chartData || data.chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))", 
              borderColor: "hsl(var(--border))",
              borderRadius: "8px"
            }}
          />
          <Legend />
          <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Sales" />
          <Bar dataKey="profit" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
