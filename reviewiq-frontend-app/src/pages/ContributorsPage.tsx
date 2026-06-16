/**
 * Contributors page.
 *
 * Pulls data from /api/contributors and renders a searchable, sortable
 * leaderboard of contributor productivity and merge-efficiency metrics.
 */

import { useMemo, useState } from "react";
import { Users, ArrowUpDown, GitPullRequest, Clock, FileDiff } from "lucide-react";
import {
  SectionHeader,
  SearchInput,
  Select,
  SkeletonGrid,
  ErrorState,
  EmptyState,
  GlassCard,
  Badge,
  type SelectOption,
} from "../components/ui";
import { useContributors } from "../hooks/useApi";
import { formatHours, formatNumber, formatSigned } from "../lib/utils";
import type { Contributor } from "../types/api.types";

type SortField = "pr_count" | "avg_merge_hours" | "avg_pr_size" | "total_additions";

const SORT_OPTIONS: SelectOption[] = [
  { value: "pr_count", label: "Sort by PR Count" },
  { value: "avg_merge_hours", label: "Sort by Avg. Merge Time" },
  { value: "avg_pr_size", label: "Sort by Avg. PR Size" },
  { value: "total_additions", label: "Sort by Lines Added" },
];

export default function ContributorsPage() {
  const { data, loading, error, refetch } = useContributors();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("pr_count");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];

    const filtered = data.filter((c) => c.author.toLowerCase().includes(search.trim().toLowerCase()));

    return [...filtered].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDesc ? -diff : diff;
    });
  }, [data, search, sortField, sortDesc]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Contributors"
        description="Productivity and merge-efficiency metrics across all engineers contributing to analyzed repositories."
      />

      {loading && <SkeletonGrid count={6} variant="metric" />}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          title="No contributors found"
          message="No contributor data has been ingested yet."
          icon={Users}
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Search contributors by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              containerClassName="sm:max-w-xs"
            />
            <div className="flex gap-2">
              <Select
                options={SORT_OPTIONS}
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                containerClassName="w-full sm:w-56"
              />
              <button
                type="button"
                onClick={() => setSortDesc((d) => !d)}
                aria-label="Toggle sort direction"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filteredAndSorted.length === 0 ? (
            <EmptyState
              title="No matches"
              message={`No contributors match "${search}".`}
              icon={Users}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSorted.map((contributor, index) => (
                <ContributorCard key={contributor.author} contributor={contributor} rank={index + 1} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ContributorCard                                                             */
/* -------------------------------------------------------------------------- */

function ContributorCard({ contributor, rank }: { contributor: Contributor; rank: number }) {
  const initials = contributor.author
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <GlassCard interactive className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{contributor.author}</p>
          <p className="text-xs text-slate-500">Rank #{rank}</p>
        </div>
        {rank <= 3 && (
          <Badge className="flex-shrink-0 bg-amber-500/10 text-amber-300 border-amber-500/30">
            Top {rank}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
        <Metric icon={GitPullRequest} label="PRs" value={formatNumber(contributor.pr_count)} />
        <Metric icon={Clock} label="Avg. Merge" value={formatHours(contributor.avg_merge_hours)} />
        <Metric icon={FileDiff} label="Avg. Size" value={`${formatNumber(Math.round(contributor.avg_pr_size))} lines`} />
        <Metric
          icon={FileDiff}
          label="Net Lines"
          value={formatSigned(contributor.total_additions - contributor.total_deletions)}
        />
      </div>
    </GlassCard>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GitPullRequest;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
