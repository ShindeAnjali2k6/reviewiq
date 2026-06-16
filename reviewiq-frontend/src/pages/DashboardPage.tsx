/**
 * Dashboard page.
 *
 * Pulls data from /api/summary, /api/contributors, /api/issues/summary,
 * and /api/bottlenecks to render KPI cards, contributor/merge-time/PR-size
 * charts, issue severity/type breakdowns, and a bottleneck overview.
 *
 * All four sources are fetched independently and each section handles
 * its own loading / error / empty / success state.
 */

import {
  GitPullRequest,
  Users,
  Clock,
  FileDiff,
  Plus,
  Minus,
  Timer,
  AlertTriangle,
} from "lucide-react";
import {
  MetricCard,
  SectionHeader,
  SkeletonGrid,
  SkeletonCard,
  ErrorState,
  EmptyState,
  GlassCard,
  Badge,
} from "../components/ui";
import {
  ChartCard,
  SimpleBarChart,
  SimplePieChart,
  type ChartDatum,
} from "../components/charts";
import { useSummary, useContributors, useIssuesSummary, useBottlenecks } from "../hooks/useApi";
import { formatHours, formatNumber, formatSigned, toTitleCase } from "../lib/utils";
import { CHART_GRADIENT, getSeverityStyle } from "../lib/constants";
import type {
  SummaryResponse,
  ContributorsResponse,
  IssuesSummaryResponse,
  BottlenecksResponse,
} from "../types/api.types";

export default function DashboardPage() {
  const summary = useSummary();
  const contributors = useContributors();
  const issuesSummary = useIssuesSummary();
  const bottlenecks = useBottlenecks();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Dashboard"
        description="Engineering productivity, merge-time trends, and ML-detected issues across all analyzed pull requests."
      />

      {/* KPI Cards from /api/summary */}
      <SummarySection
        loading={summary.loading}
        error={summary.error}
        data={summary.data}
        onRetry={summary.refetch}
      />

      {/* Contributor / merge-time / PR-size charts from /api/contributors */}
      <ContributorChartsSection
        loading={contributors.loading}
        error={contributors.error}
        data={contributors.data}
        onRetry={contributors.refetch}
      />

      {/* Issue severity / type breakdown from /api/issues/summary */}
      <IssueBreakdownSection
        loading={issuesSummary.loading}
        error={issuesSummary.error}
        data={issuesSummary.data}
        onRetry={issuesSummary.refetch}
      />

      {/* Bottleneck overview from /api/bottlenecks */}
      <BottleneckOverviewSection
        loading={bottlenecks.loading}
        error={bottlenecks.error}
        data={bottlenecks.data}
        onRetry={bottlenecks.refetch}
        bottleneckCount={summary.data?.bottleneck_count}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared section prop shape                                                   */
/* -------------------------------------------------------------------------- */

interface SectionProps<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  onRetry: () => void;
}

/* -------------------------------------------------------------------------- */
/* Summary KPI section                                                         */
/* -------------------------------------------------------------------------- */

function SummarySection({ loading, error, data, onRetry }: SectionProps<SummaryResponse>) {
  if (loading) return <SkeletonGrid count={4} variant="metric" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data) return <EmptyState title="No summary data" message="The summary endpoint returned no data." />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Pull Requests"
        value={formatNumber(data.total_prs)}
        icon={GitPullRequest}
        iconClassName="text-indigo-300 bg-indigo-500/10 border-indigo-500/20"
      />
      <MetricCard
        label="Unique Contributors"
        value={formatNumber(data.unique_contributors)}
        icon={Users}
        iconClassName="text-violet-300 bg-violet-500/10 border-violet-500/20"
      />
      <MetricCard
        label="Avg. Merge Time"
        value={formatHours(data.avg_merge_hours)}
        icon={Clock}
        iconClassName="text-cyan-300 bg-cyan-500/10 border-cyan-500/20"
        hint={`${data.avg_merge_hours.toFixed(1)} hours on average`}
      />
      <MetricCard
        label="Avg. PR Size"
        value={formatNumber(Math.round(data.avg_pr_size))}
        unit="lines"
        icon={FileDiff}
        iconClassName="text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20"
      />
      <MetricCard
        label="Lines Added"
        value={formatSigned(data.total_additions)}
        icon={Plus}
        iconClassName="text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
      />
      <MetricCard
        label="Lines Removed"
        value={formatNumber(data.total_deletions)}
        icon={Minus}
        iconClassName="text-rose-300 bg-rose-500/10 border-rose-500/20"
      />
      <MetricCard
        label="Bottlenecks Detected"
        value={formatNumber(data.bottleneck_count)}
        icon={Timer}
        iconClassName="text-amber-300 bg-amber-500/10 border-amber-500/20"
      />
      <MetricCard
        label="Net Lines Changed"
        value={formatSigned(data.total_additions - data.total_deletions)}
        icon={FileDiff}
        iconClassName="text-slate-300 bg-slate-500/10 border-slate-500/20"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Contributor-derived charts section                                         */
/* -------------------------------------------------------------------------- */

function ContributorChartsSection({ loading, error, data, onRetry }: SectionProps<ContributorsResponse>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard variant="chart" />
        <SkeletonCard variant="chart" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No contributor data"
        message="No contributors have been analyzed yet. Check back once PRs have been ingested."
      />
    );
  }

  const topByPRs = [...data]
    .sort((a, b) => b.pr_count - a.pr_count)
    .slice(0, 8)
    .map<ChartDatum>((c) => ({ name: c.author, value: c.pr_count }));

  const mergeTimeByContributor = [...data]
    .sort((a, b) => b.avg_merge_hours - a.avg_merge_hours)
    .slice(0, 8)
    .map<ChartDatum>((c) => ({ name: c.author, value: Math.round(c.avg_merge_hours * 10) / 10 }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Top Contributors by PR Count" subtitle="Number of pull requests per contributor">
        <SimpleBarChart data={topByPRs} color="#6366f1" valueFormatter={(v) => `${formatNumber(v)} PRs`} />
      </ChartCard>

      <ChartCard title="Avg. Merge Time by Contributor" subtitle="Hours from open to merge (top 8 by duration)">
        <SimpleBarChart
          data={mergeTimeByContributor}
          color="#22d3ee"
          horizontal
          valueFormatter={(v) => formatHours(v)}
        />
      </ChartCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Issue breakdown section                                                     */
/* -------------------------------------------------------------------------- */

function IssueBreakdownSection({ loading, error, data, onRetry }: SectionProps<IssuesSummaryResponse>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard variant="chart" />
        <SkeletonCard variant="chart" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!data || data.total === 0) {
    return (
      <EmptyState
        title="No issues detected"
        message="The ML classifier has not flagged any issues in the analyzed pull requests."
        icon={AlertTriangle}
      />
    );
  }

  const bySeverity = Object.entries(data.by_severity).map<ChartDatum>(([severity, count]) => ({
    name: toTitleCase(severity),
    value: count,
  }));

  const byType = Object.entries(data.by_type)
    .sort((a, b) => b[1] - a[1])
    .map<ChartDatum>(([type, count]) => ({ name: toTitleCase(type), value: count }));

  const severityColors = Object.keys(data.by_severity).map((s) => getSeverityStyle(s).chartColor);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Issues by Severity" subtitle={`${formatNumber(data.total)} total issues detected`}>
        <SimplePieChart data={bySeverity} colors={severityColors.length ? severityColors : CHART_GRADIENT} />
      </ChartCard>

      <ChartCard title="Issues by Type" subtitle="Distribution of ML-classified issue categories">
        <SimpleBarChart data={byType} color="#a855f7" valueFormatter={(v) => `${formatNumber(v)} issues`} />
      </ChartCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottleneck overview section                                                 */
/* -------------------------------------------------------------------------- */

function BottleneckOverviewSection({
  loading,
  error,
  data,
  onRetry,
  bottleneckCount,
}: SectionProps<BottlenecksResponse> & { bottleneckCount?: number }) {
  if (loading) return <SkeletonCard variant="list" lines={5} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No bottlenecks detected"
        message="No pull requests currently exceed merge-time bottleneck thresholds."
        icon={Timer}
      />
    );
  }

  const sorted = [...data].sort((a, b) => b.merge_duration_hours - a.merge_duration_hours).slice(0, 5);

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Bottlenecks</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Pull requests with the longest merge durations
            {typeof bottleneckCount === "number" && (
              <> &middot; {formatNumber(bottleneckCount)} flagged total</>
            )}
          </p>
        </div>
        <Badge dotClassName="bg-amber-500" className="bg-amber-500/10 text-amber-300 border-amber-500/30">
          {formatNumber(data.length)} bottlenecks
        </Badge>
      </div>

      <div className="flex flex-col divide-y divide-white/5">
        {sorted.map((b) => (
          <div key={b.github_id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{b.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                by {b.author} &middot; {formatNumber(b.total_changes)} lines changed
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 flex-shrink-0">
              {formatHours(b.merge_duration_hours)}
            </Badge>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
