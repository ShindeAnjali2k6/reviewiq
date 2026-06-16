/**
 * Consolidated UI primitives for ReviewIQ.
 *
 * Includes: GlassCard, Badge, MetricCard, Button, SearchInput, Select,
 * Pagination, SkeletonCard/SkeletonGrid, ErrorState, EmptyState,
 * SectionHeader, and Table primitives. Kept in one file to minimize
 * file count for this portfolio-scale project.
 */

import {
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import { motion } from "framer-motion";
import {
  type LucideIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RotateCw,
  Inbox,
  Loader2,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "../lib/utils";

/* -------------------------------------------------------------------------- */
/* GlassCard                                                                   */
/* -------------------------------------------------------------------------- */

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  noPadding?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = false, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
          "shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
          !noPadding && "p-5 sm:p-6",
          interactive &&
            "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  dotClassName?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, dotClassName, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
          "bg-slate-500/10 text-slate-300 border-slate-500/30",
          className,
        )}
        {...props}
      >
        {dotClassName && <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />}
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";

/* -------------------------------------------------------------------------- */
/* MetricCard                                                                  */
/* -------------------------------------------------------------------------- */

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: number;
  hint?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  iconClassName,
  trend,
  hint,
  className,
}: MetricCardProps) {
  const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
  const trendPositive = hasTrend && trend! >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <GlassCard interactive className={cn("flex h-full flex-col justify-between gap-4", className)}>
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-slate-400">{label}</span>
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                iconClassName,
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
          </div>

          {hasTrend && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trendPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
              )}
            >
              {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend!).toFixed(1)}%
            </span>
          )}
        </div>

        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </GlassCard>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:brightness-110",
  secondary: "bg-white/[0.06] text-white border border-white/10 hover:bg-white/10",
  ghost: "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
  outline: "bg-transparent text-slate-200 border border-white/15 hover:border-white/30 hover:bg-white/5",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
          buttonVariantClasses[variant],
          buttonSizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

/* -------------------------------------------------------------------------- */
/* SearchInput                                                                 */
/* -------------------------------------------------------------------------- */

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, value, onClear, ...props }, ref) => {
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          ref={ref}
          type="text"
          value={value}
          className={cn(
            "h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-9 text-sm text-white placeholder:text-slate-500",
            "transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20",
            className,
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

/* -------------------------------------------------------------------------- */
/* Select                                                                      */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, options, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] pl-3 pr-9 text-sm text-white",
            "transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20",
            "cursor-pointer",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    );
  },
);
Select.displayName = "Select";

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageWindow(current: number, total: number, windowSize = 5): number[] {
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = start + windowSize - 1;

  if (end > total) {
    end = total;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageWindow(currentPage, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages[0] > 1 && (
        <>
          <PageButton page={1} active={currentPage === 1} onClick={onPageChange} />
          {pages[0] > 2 && <span className="px-1 text-slate-500">…</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton key={page} page={page} active={page === currentPage} onClick={onPageChange} />
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-500">…</span>}
          <PageButton page={totalPages} active={currentPage === totalPages} onClick={onPageChange} />
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: (page: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
          : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10",
      )}
    >
      {page}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                   */
/* -------------------------------------------------------------------------- */

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/10", className)} />;
}

export interface SkeletonCardProps {
  className?: string;
  lines?: number;
  variant?: "metric" | "chart" | "list";
}

export function SkeletonCard({ className, lines = 3, variant = "metric" }: SkeletonCardProps) {
  if (variant === "chart") {
    return (
      <GlassCard className={cn("flex flex-col gap-4", className)}>
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-48 w-full" />
      </GlassCard>
    );
  }

  if (variant === "list") {
    return (
      <GlassCard className={cn("flex flex-col gap-3", className)}>
        <SkeletonLine className="h-4 w-1/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} className="h-10 w-full" />
        ))}
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between">
        <SkeletonLine className="h-4 w-2/5" />
        <SkeletonLine className="h-9 w-9 rounded-xl" />
      </div>
      <SkeletonLine className="h-8 w-1/3" />
      {lines > 0 && <SkeletonLine className="h-3 w-1/2" />}
    </GlassCard>
  );
}

export interface SkeletonGridProps {
  count?: number;
  variant?: SkeletonCardProps["variant"];
  className?: string;
}

export function SkeletonGrid({ count = 4, variant = "metric", className }: SkeletonGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ErrorState / EmptyState                                                     */
/* -------------------------------------------------------------------------- */

export interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Unable to load data", message, onRetry, className }: ErrorStateProps) {
  return (
    <GlassCard className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <AlertCircle className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-slate-400">
          {message ?? "The server returned an unexpected error. Please try again."}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10"
        >
          <RotateCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </GlassCard>
  );
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title = "Nothing to show yet",
  message = "No data is available for this view right now.",
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-slate-400">{message}</p>
      </div>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader                                                               */
/* -------------------------------------------------------------------------- */

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Table primitives                                                            */
/* -------------------------------------------------------------------------- */

export function TableContainer({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-white/10", className)} {...props}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-white/5", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-white/[0.03]", className)} {...props}>
      {children}
    </tr>
  );
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({ className, children, sortDirection, onSort, ...props }: TableHeaderCellProps) {
  const sortable = typeof onSort === "function";

  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 font-medium",
        sortable && "cursor-pointer select-none hover:text-slate-200",
        className,
      )}
      onClick={onSort}
      {...props}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {sortable && (
          <>
            {sortDirection === "asc" && <ArrowUp className="h-3.5 w-3.5" />}
            {sortDirection === "desc" && <ArrowDown className="h-3.5 w-3.5" />}
            {!sortDirection && <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
          </>
        )}
      </span>
    </th>
  );
}

export function TableCell({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 align-middle text-slate-200", className)} {...props}>
      {children}
    </td>
  );
}
