/**
 * Bottlenecks page.
 *
 * Pulls data from /api/bottlenecks and renders a sortable table of
 * delayed pull requests, a delay-distribution chart, and derived risk
 * indicators based on merge duration thresholds.
 */

import { useMemo, useState } from "react";
import { Timer } from "lucide-react";
import {
  SectionHeader,
  Badge,
  SkeletonCard,
  ErrorState,
  EmptyState,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../components/ui";
import { ChartCard, SimpleBarChart, type ChartDatum } from "../components/charts";
import { useBottlenecks } from "../hooks/useApi";
import { getRiskLevel, RISK_STYLES } from "../lib/constants";
import { formatHours, formatNumber } from "../lib/utils";
import type { Bottleneck } from "../types/api.types";

type SortField = "merge_duration_hours" | "total_changes";

export default function BottlenecksPage() {
  const { data, loading, error, refetch } = useBottlenecks();
  const [sortField, setSortField] = useState<SortField>("merge_duration_hours");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDesc ? -diff : diff;
    });
  }, [data, sortField, sortDesc]);

  const chartData = useMemo<ChartDatum[]>(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => b.merge_duration_hours - a.merge_duration_hours)
      .slice(0, 8)
      .map((b) => ({
        name: b.title.length > 24 ? `${b.title.slice(0, 24)}…` : b.title,
        value: Math.round(b.merge_duration_hours * 10) / 10,
      }));
  }, [data]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDesc((d) => !d);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Bottlenecks"
        description="Pull requests with abnormally long merge durations, ranked by delay and risk level."
      />

      {loading && (
        <div className="flex flex-col gap-6">
          <SkeletonCard variant="chart" />
          <SkeletonCard variant="list" lines={6} />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          title="No bottlenecks detected"
          message="No pull requests currently exceed merge-time bottleneck thresholds."
          icon={Timer}
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <ChartCard
            title="Longest Merge Delays"
            subtitle="Top 8 pull requests by merge duration (hours)"
            height={320}
          >
            <SimpleBarChart data={chartData} color="#fb923c" horizontal valueFormatter={(v) => formatHours(v)} />
          </ChartCard>

          <TableContainer>
            <TableHead>
              <tr>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Author</TableHeaderCell>
                <TableHeaderCell
                  sortDirection={sortField === "merge_duration_hours" ? (sortDesc ? "desc" : "asc") : null}
                  onSort={() => toggleSort("merge_duration_hours")}
                >
                  Merge Duration
                </TableHeaderCell>
                <TableHeaderCell
                  sortDirection={sortField === "total_changes" ? (sortDesc ? "desc" : "asc") : null}
                  onSort={() => toggleSort("total_changes")}
                >
                  Total Changes
                </TableHeaderCell>
                <TableHeaderCell>Risk</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {sorted.map((bottleneck) => (
                <BottleneckRow key={bottleneck.github_id} bottleneck={bottleneck} />
              ))}
            </TableBody>
          </TableContainer>

          <p className="text-xs text-slate-500">
            Showing {formatNumber(sorted.length)} bottleneck{sorted.length === 1 ? "" : "s"}
          </p>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BottleneckRow                                                              */
/* -------------------------------------------------------------------------- */

function BottleneckRow({ bottleneck }: { bottleneck: Bottleneck }) {
  const riskLevel = getRiskLevel(bottleneck.merge_duration_hours);
  const riskStyle = RISK_STYLES[riskLevel];

  return (
    <TableRow>
      <TableCell className="max-w-xs">
        <p className="truncate font-medium text-white">{bottleneck.title}</p>
        <p className="text-xs text-slate-500">#{bottleneck.github_id}</p>
      </TableCell>
      <TableCell>{bottleneck.author}</TableCell>
      <TableCell className="font-mono text-sm">{formatHours(bottleneck.merge_duration_hours)}</TableCell>
      <TableCell className="font-mono text-sm">{formatNumber(bottleneck.total_changes)} lines</TableCell>
      <TableCell>
        <Badge className={riskStyle.badgeClass}>{riskStyle.label}</Badge>
      </TableCell>
    </TableRow>
  );
}
