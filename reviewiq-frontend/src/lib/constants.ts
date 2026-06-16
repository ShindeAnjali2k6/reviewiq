/**
 * Centralized design tokens and lookup maps used across the app.
 * Keeping these in one place ensures consistent colors/labels for
 * severities, issue types, and chart series everywhere they appear.
 */

import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Timer,
  Brain,
  Activity,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Contributors", path: "/contributors", icon: Users },
  { label: "Issues", path: "/issues", icon: AlertTriangle },
  { label: "Bottlenecks", path: "/bottlenecks", icon: Timer },
  { label: "ML Classifier", path: "/classifier", icon: Brain },
  { label: "System Status", path: "/status", icon: Activity },
];

/* -------------------------------------------------------------------------- */
/* Severity styling                                                           */
/* -------------------------------------------------------------------------- */

export type SeverityKey = "critical" | "high" | "medium" | "low" | "default";

export interface SeverityStyle {
  label: string;
  badgeClass: string;
  dotClass: string;
  chartColor: string;
}

export const SEVERITY_STYLES: Record<SeverityKey, SeverityStyle> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    dotClass: "bg-rose-500",
    chartColor: "#fb7185",
  },
  high: {
    label: "High",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    dotClass: "bg-amber-500",
    chartColor: "#f59e0b",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    dotClass: "bg-yellow-500",
    chartColor: "#eab308",
  },
  low: {
    label: "Low",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-500",
    chartColor: "#10b981",
  },
  default: {
    label: "Unknown",
    badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    dotClass: "bg-slate-500",
    chartColor: "#64748b",
  },
};

/**
 * Resolve a severity string (case-insensitive, from the API) to a style
 * definition. Falls back to "default" for unrecognized values.
 */
export function getSeverityStyle(severity: string): SeverityStyle {
  const key = severity?.toLowerCase?.() as SeverityKey;
  return SEVERITY_STYLES[key] ?? SEVERITY_STYLES.default;
}

/* -------------------------------------------------------------------------- */
/* Risk styling (bottlenecks)                                                  */
/* -------------------------------------------------------------------------- */

export type RiskKey = "critical" | "high" | "moderate" | "low";

export interface RiskStyle {
  label: string;
  badgeClass: string;
  chartColor: string;
}

export const RISK_STYLES: Record<RiskKey, RiskStyle> = {
  critical: {
    label: "Critical Delay",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    chartColor: "#fb7185",
  },
  high: {
    label: "High Delay",
    badgeClass: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    chartColor: "#fb923c",
  },
  moderate: {
    label: "Moderate Delay",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    chartColor: "#f59e0b",
  },
  low: {
    label: "Healthy",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    chartColor: "#10b981",
  },
};

/**
 * Derive a risk level from merge duration in hours.
 * Thresholds are presentation-only and do not alter underlying data.
 */
export function getRiskLevel(mergeDurationHours: number): RiskKey {
  if (mergeDurationHours >= 168) return "critical"; // 7+ days
  if (mergeDurationHours >= 72) return "high"; // 3-7 days
  if (mergeDurationHours >= 24) return "moderate"; // 1-3 days
  return "low";
}

/* -------------------------------------------------------------------------- */
/* Chart palette                                                               */
/* -------------------------------------------------------------------------- */

export const CHART_COLORS = {
  primary: "#6366f1", // indigo-500
  secondary: "#a855f7", // purple-500
  tertiary: "#ec4899", // pink-500
  accent: "#22d3ee", // cyan-400
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#fb7185",
  muted: "#64748b",
};

export const CHART_GRADIENT = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#22d3ee"];

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/* Health status styling                                                      */
/* -------------------------------------------------------------------------- */

export type HealthStatusKey = "healthy" | "degraded" | "down" | "unknown";

export interface HealthStyle {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const HEALTH_STYLES: Record<HealthStatusKey, HealthStyle> = {
  healthy: {
    label: "Healthy",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  degraded: {
    label: "Degraded",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  down: {
    label: "Down",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  unknown: {
    label: "Unknown",
    badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    dotClass: "bg-slate-500",
  },
};

export function getHealthStyle(status: string | undefined): HealthStyle {
  const key = status?.toLowerCase?.() as HealthStatusKey;
  return HEALTH_STYLES[key] ?? HEALTH_STYLES.unknown;
}
