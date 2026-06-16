/**
 * Consolidated chart components for ReviewIQ.
 *
 * Includes: ChartCard wrapper + Bar/Line/Pie chart wrappers and a
 * probability breakdown bar chart used on the ML Classifier page.
 * All charts are themed for the dark glass UI via shared style tokens.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { GlassCard } from "./ui";
import { cn } from "../lib/utils";
import { CHART_COLORS, CHART_GRADIENT } from "../lib/constants";

/* -------------------------------------------------------------------------- */
/* Shared style tokens                                                         */
/* -------------------------------------------------------------------------- */

export const chartTooltipStyle = {
  backgroundColor: "rgba(15, 17, 23, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "8px 12px",
  fontSize: "12px",
  color: "#e2e8f0",
  boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
};

export const chartLabelStyle = {
  color: "#94a3b8",
  fontWeight: 600,
  marginBottom: "4px",
};

export const chartAxisStyle = {
  fontSize: 12,
  fill: "#64748b",
};

export const chartGridStroke = "rgba(255,255,255,0.06)";

/* -------------------------------------------------------------------------- */
/* ChartCard wrapper                                                           */
/* -------------------------------------------------------------------------- */

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number;
  className?: string;
  children: React.ReactElement;
}

export function ChartCard({ title, subtitle, action, height = 280, className, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("h-full", className)}
    >
      <GlassCard className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </div>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Generic chart data point                                                    */
/* -------------------------------------------------------------------------- */

export interface ChartDatum {
  name: string;
  value: number;
  [key: string]: string | number;
}

/* -------------------------------------------------------------------------- */
/* SimpleBarChart                                                              */
/* -------------------------------------------------------------------------- */

export interface SimpleBarChartProps {
  data: ChartDatum[];
  dataKey?: string;
  color?: string;
  valueFormatter?: (value: number) => string;
  horizontal?: boolean;
}

export function SimpleBarChart({
  data,
  dataKey = "value",
  color = CHART_COLORS.primary,
  valueFormatter,
  horizontal = false,
}: SimpleBarChartProps) {
  if (horizontal) {
    return (
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={chartGridStroke} horizontal={false} />
        <XAxis type="number" tick={chartAxisStyle} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={chartAxisStyle}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={chartTooltipStyle}
          labelStyle={chartLabelStyle}
          formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]} maxBarSize={28} />
      </BarChart>
    );
  }

  return (
    <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
      <CartesianGrid stroke={chartGridStroke} vertical={false} />
      <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} width={40} />
      <Tooltip
        contentStyle={chartTooltipStyle}
        labelStyle={chartLabelStyle}
        formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
        cursor={{ fill: "rgba(255,255,255,0.04)" }}
      />
      <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
    </BarChart>
  );
}

/* -------------------------------------------------------------------------- */
/* SimpleLineChart                                                             */
/* -------------------------------------------------------------------------- */

export interface SimpleLineChartProps {
  data: ChartDatum[];
  dataKey?: string;
  color?: string;
  valueFormatter?: (value: number) => string;
}

export function SimpleLineChart({
  data,
  dataKey = "value",
  color = CHART_COLORS.accent,
  valueFormatter,
}: SimpleLineChartProps) {
  return (
    <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
      <CartesianGrid stroke={chartGridStroke} vertical={false} />
      <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} width={40} />
      <Tooltip
        contentStyle={chartTooltipStyle}
        labelStyle={chartLabelStyle}
        formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
        cursor={{ stroke: "rgba(255,255,255,0.1)" }}
      />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2.5}
        dot={{ r: 3, fill: color, strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  );
}

/* -------------------------------------------------------------------------- */
/* SimplePieChart                                                              */
/* -------------------------------------------------------------------------- */

export interface SimplePieChartProps {
  data: ChartDatum[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export function SimplePieChart({ data, colors = CHART_GRADIENT, valueFormatter }: SimplePieChartProps) {
  return (
    <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius="55%"
        outerRadius="85%"
        paddingAngle={2}
        stroke="none"
      >
        {data.map((_, index) => (
          <Cell key={index} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={chartTooltipStyle}
        labelStyle={chartLabelStyle}
        formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
      />
      <Legend
        verticalAlign="bottom"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "8px" }}
      />
    </PieChart>
  );
}

/* -------------------------------------------------------------------------- */
/* ProbabilityBars (ML Classifier page)                                        */
/* -------------------------------------------------------------------------- */

export interface ProbabilityBarsProps {
  /** class_probs from /api/predict, e.g. { bug: 0.7, feature: 0.2, ... } */
  probabilities: Record<string, number>;
  /** the predicted_class to highlight */
  predictedClass?: string;
}

/**
 * Horizontal stacked bars showing the model's class probability
 * breakdown, sorted descending. The predicted class is highlighted
 * with the primary gradient color; others use a muted tone.
 */
export function ProbabilityBars({ probabilities, predictedClass }: ProbabilityBarsProps) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No probability data returned.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([label, value]) => {
        const isPredicted = label === predictedClass;
        const percent = Math.max(0, Math.min(1, value)) * 100;

        return (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className={cn("font-medium", isPredicted ? "text-white" : "text-slate-300")}>{label}</span>
              <span className={cn("font-mono text-xs", isPredicted ? "text-indigo-300" : "text-slate-500")}>
                {percent.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isPredicted
                    ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                    : "bg-slate-500/50",
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
