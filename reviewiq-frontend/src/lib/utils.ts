/**
 * Shared utility functions: class-name merging and formatters used
 * across cards, charts, and tables for consistent number/time display.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicts (e.g. px-2 vs px-4).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with thousands separators.
 * Returns "—" for null/undefined/NaN.
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format a number compactly (e.g. 1.2K, 3.4M).
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a duration given in hours into a human-readable string.
 * e.g. 0.5 -> "30m", 4.5 -> "4.5h", 36 -> "1.5d", 168 -> "7d"
 */
export function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";

  if (value < 1) {
    const minutes = Math.round(value * 60);
    return `${minutes}m`;
  }

  if (value < 24) {
    return `${trimDecimal(value)}h`;
  }

  const days = value / 24;
  return `${trimDecimal(days)}d`;
}

/**
 * Trim a number to at most 1 decimal place, dropping trailing ".0".
 */
export function trimDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? `${rounded}` : `${rounded.toFixed(1)}`;
}

/**
 * Format a percentage from a 0-1 fraction (e.g. 0.873 -> "87.3%").
 */
export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/**
 * Format a signed line-count delta (e.g. +120 / -45).
 */
export function formatSigned(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

/**
 * Capitalize the first letter of a string, lower-casing the rest.
 * Useful for normalizing severity/issue-type strings from the API.
 */
export function toTitleCase(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Safely extract a human-readable error message from an unknown error,
 * including Axios-style errors with response data.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const err = error as {
      response?: { data?: { detail?: string; message?: string } };
      message?: string;
    };

    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;

    const message = err.response?.data?.message ?? err.message;
    if (typeof message === "string") return message;
  }

  return "Something went wrong. Please try again.";
}
