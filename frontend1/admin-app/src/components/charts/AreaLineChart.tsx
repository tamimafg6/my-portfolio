"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

interface DataPoint {
  month: string;
  revenue: number;
  sales: number;
}

interface AreaLineChartProps {
  data: DataPoint[];
}

export function AreaLineChart({ data }: AreaLineChartProps) {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState<"Day" | "Week" | "Month">(
    "Month"
  );
  const [isDark, setIsDark] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(1200);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Update chart width based on container size
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Use the actual container width, with a minimum for very small screens
        setChartWidth(Math.max(width || 1200, 600));
      }
    };

    // Initial update
    updateWidth();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback to window resize
    window.addEventListener("resize", updateWidth);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Calculate max value with padding
  const rawMax = Math.max(...data.flatMap((d) => [d.revenue, d.sales]));
  const maxValue = Math.ceil(rawMax / 20) * 20 + 20;

  // Chart dimensions - responsive to container width
  const chartHeight = 260;
  const margin = { top: 8, right: 20, bottom: 28, left: 40 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Generate Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxValue / 4) * i)
  );

  // Calculate points
  const getX = (index: number) => {
    // Guard against division by zero when data.length === 1
    if (data.length === 1) {
      return margin.left + innerWidth / 2;
    }
    const denominator = Math.max(1, data.length - 1);
    return margin.left + (index / denominator) * innerWidth;
  };
  const getY = (value: number) =>
    margin.top + innerHeight - (value / maxValue) * innerHeight;

  const revenuePoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.revenue),
    value: d.revenue,
  }));
  const salesPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.sales),
    value: d.sales,
  }));

  // Create smooth curve path using cardinal spline
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  // Create area path
  const createAreaPath = (points: { x: number; y: number }[]) => {
    const linePath = createSmoothPath(points);
    const baseY = margin.top + innerHeight;
    return `${linePath} L ${points[points.length - 1].x} ${baseY} L ${
      points[0].x
    } ${baseY} Z`;
  };

  const revenueLinePath = createSmoothPath(revenuePoints);
  const salesLinePath = createSmoothPath(salesPoints);
  const revenueAreaPath = createAreaPath(revenuePoints);
  const salesAreaPath = createAreaPath(salesPoints);

  // Colors
  const revenueColor = isDark ? "hsl(0, 85%, 55%)" : "hsl(0, 80%, 45%)";
  const salesColor = isDark ? "hsl(0, 70%, 70%)" : "hsl(0, 65%, 60%)";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: revenueColor }}
            />
            <span className="text-sm text-foreground/80">{t("Revenue", "Revenu")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: salesColor }}
            />
            <span className="text-sm text-foreground/80">{t("Sales", "Ventes")}</span>
          </div>
        </div>

        <div className="flex bg-muted/50 rounded-lg p-0.5">
          {(["Day", "Week", "Month"] as const).map((period) => {
            const periodLabels: Record<"Day" | "Week" | "Month", { en: string; fr: string }> = {
              Day: { en: "Day", fr: "Jour" },
              Week: { en: "Week", fr: "Semaine" },
              Month: { en: "Month", fr: "Mois" },
            };
            const label = periodLabels[period];
            return (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  timePeriod === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(label.en, label.fr)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full" ref={containerRef}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Revenue gradient */}
            <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={revenueColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={revenueColor} stopOpacity="0.02" />
            </linearGradient>
            {/* Sales gradient */}
            <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={salesColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={salesColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={margin.left}
              y1={getY(tick)}
              x2={margin.left + innerWidth}
              y2={getY(tick)}
              stroke={gridColor}
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <text
              key={`label-${tick}`}
              x={margin.left - 10}
              y={getY(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill={textColor}
            >
              {tick}
            </text>
          ))}

          {/* Area fills */}
          <path d={salesAreaPath} fill="url(#salesGrad)" />
          <path d={revenueAreaPath} fill="url(#revenueGrad)" />

          {/* Lines */}
          <path
            d={salesLinePath}
            fill="none"
            stroke={salesColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={revenueLinePath}
            fill="none"
            stroke={revenueColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {revenuePoints.map((point, i) => (
            <g key={`revenue-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === i ? 6 : 4}
                fill={revenueColor}
                stroke={isDark ? "#1a1a1a" : "#fff"}
                strokeWidth="2"
                className="transition-all duration-150"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
          {salesPoints.map((point, i) => (
            <circle
              key={`sales-${i}`}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? 5 : 3}
              fill={salesColor}
              stroke={isDark ? "#1a1a1a" : "#fff"}
              strokeWidth="1.5"
              className="transition-all duration-150"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={`x-${i}`}
              x={getX(i)}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="11"
              fill={textColor}
            >
              {d.month}
            </text>
          ))}

          {/* Hover tooltip */}
          {hoveredPoint !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoveredPoint)}
                y1={margin.top}
                x2={getX(hoveredPoint)}
                y2={margin.top + innerHeight}
                stroke={gridColor}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              {/* Tooltip box */}
              <g
                transform={`translate(${getX(hoveredPoint) - 45}, ${
                  margin.top - 5
                })`}
              >
                <rect
                  x="0"
                  y="0"
                  width="90"
                  height="50"
                  rx="6"
                  fill={isDark ? "#2a2a2a" : "#fff"}
                  stroke={isDark ? "#3a3a3a" : "#e5e5e5"}
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                />
                <text x="10" y="18" fontSize="10" fill={textColor}>
                  {data[hoveredPoint].month}
                </text>
                <text
                  x="10"
                  y="32"
                  fontSize="11"
                  fill={revenueColor}
                  fontWeight="500"
                >
                  {t("Rev", "Rev")}: ${data[hoveredPoint].revenue}
                </text>
                <text
                  x="10"
                  y="44"
                  fontSize="11"
                  fill={salesColor}
                  fontWeight="500"
                >
                  {t("Sales", "Ventes")}: {data[hoveredPoint].sales}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
