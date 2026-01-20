"use client";

import { useLanguage } from "@/lib/i18n";

interface DataPoint {
  day: string;
  sales: number;
  revenue: number;
}

interface StackedBarChartProps {
  data: DataPoint[];
}

export function StackedBarChart({ data }: StackedBarChartProps) {
  const { t } = useLanguage();
  
  // Guard against empty data array (Math.max(...[]) === -Infinity)
  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("No data available", "Aucune donnée disponible")}</p>
        </div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map((d) => d.sales + d.revenue));

  const _chartHeight = 200;
  const _barWidth = 40;
  const _gap = 20;

  return (
    <div className="space-y-4">
      {/* Header with legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm font-medium">{t("Sales", "Ventes")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300" />
            <span className="text-sm font-medium">{t("Revenue", "Revenu")}</span>
          </div>
        </div>
        <select className="px-3 py-1 text-xs border border-input rounded-md bg-background">
          <option>{t("This Week", "Cette semaine")}</option>
          <option>{t("Last Week", "Semaine dernière")}</option>
          <option>{t("This Month", "Ce mois")}</option>
        </select>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => {
          const total = item.sales + item.revenue;
          const salesHeight = (item.sales / maxValue) * 100;
          const revenueHeight = (item.revenue / maxValue) * 100;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
              style={{ height: "100%" }}
            >
              <div
                className="relative w-full flex flex-col justify-end"
                style={{ height: "100%" }}
              >
                {/* Stacked bars - Revenue on bottom, Sales on top */}
                <div
                  className="w-full bg-blue-600 rounded-t"
                  style={{
                    height: `${salesHeight}%`,
                    minHeight: salesHeight > 0 ? "2px" : "0",
                  }}
                />
                <div
                  className="w-full bg-blue-300 rounded-t"
                  style={{
                    height: `${revenueHeight}%`,
                    minHeight: revenueHeight > 0 ? "2px" : "0",
                  }}
                />
                {/* Value label */}
                {total > 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    {total.toFixed(0)}
                  </div>
                )}
              </div>
              {/* Day label */}
              <div className="text-xs text-muted-foreground mt-1">
                {item.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

