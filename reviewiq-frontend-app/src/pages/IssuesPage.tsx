/**
 * Issues page.
 *
 * Pulls data from /api/issues and /api/issues/summary. Renders a
 * searchable, filterable, paginated table of ML-detected issues with
 * expandable rows showing explanation and suggested fix.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import {
  SectionHeader,
  SearchInput,
  Select,
  Badge,
  Pagination,
  SkeletonCard,
  ErrorState,
  EmptyState,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  type SelectOption,
} from "../components/ui";
import { useIssues, useIssuesSummary } from "../hooks/useApi";
import { getSeverityStyle, DEFAULT_PAGE_SIZE } from "../lib/constants";
import { formatNumber, toTitleCase } from "../lib/utils";
import type { Issue } from "../types/api.types";

const ALL_VALUE = "__all__";

export default function IssuesPage() {
  const { data, loading, error, refetch } = useIssues();
  const issuesSummary = useIssuesSummary();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState(ALL_VALUE);
  const [typeFilter, setTypeFilter] = useState(ALL_VALUE);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const severityOptions: SelectOption[] = useMemo(() => {
    const severities = issuesSummary.data ? Object.keys(issuesSummary.data.by_severity) : [];
    return [
      { value: ALL_VALUE, label: "All Severities" },
      ...severities.map((s) => ({ value: s, label: toTitleCase(s) })),
    ];
  }, [issuesSummary.data]);

  const typeOptions: SelectOption[] = useMemo(() => {
    const types = issuesSummary.data ? Object.keys(issuesSummary.data.by_type) : [];
    return [
      { value: ALL_VALUE, label: "All Issue Types" },
      ...types.map((t) => ({ value: t, label: toTitleCase(t) })),
    ];
  }, [issuesSummary.data]);

  const filtered = useMemo(() => {
    if (!data) return [];

    return data.filter((issue) => {
      const matchesSearch =
        search.trim().length === 0 ||
        issue.explanation.toLowerCase().includes(search.toLowerCase()) ||
        issue.suggestion.toLowerCase().includes(search.toLowerCase()) ||
        String(issue.pr_id).includes(search.trim());

      const matchesSeverity = severityFilter === ALL_VALUE || issue.severity === severityFilter;
      const matchesType = typeFilter === ALL_VALUE || issue.issue_type === typeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [data, search, severityFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Issues"
        description="ML-classified issues detected across pull requests, with severity, explanation, and suggested fixes."
      />

      {loading && <SkeletonCard variant="list" lines={6} />}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          title="No issues detected"
          message="The ML classifier hasn't flagged any issues yet."
          icon={AlertTriangle}
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Search by PR ID, explanation, or suggestion…"
              value={search}
              onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
              onClear={() => resetPageAnd(setSearch)("")}
              containerClassName="sm:max-w-sm"
            />
            <Select
              options={severityOptions}
              value={severityFilter}
              onChange={(e) => resetPageAnd(setSeverityFilter)(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => resetPageAnd(setTypeFilter)(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No matching issues" message="Try adjusting your search or filters." icon={AlertTriangle} />
          ) : (
            <>
              <TableContainer>
                <TableHead>
                  <tr>
                    <TableHeaderCell>PR ID</TableHeaderCell>
                    <TableHeaderCell>Issue Type</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>Explanation</TableHeaderCell>
                    <TableHeaderCell className="text-right">Details</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {paginated.map((issue, idx) => (
                    <IssueRow
                      key={`${issue.pr_id}-${idx}`}
                      issue={issue}
                      expanded={expandedId === issue.pr_id}
                      onToggle={() => setExpandedId((id) => (id === issue.pr_id ? null : issue.pr_id))}
                    />
                  ))}
                </TableBody>
              </TableContainer>

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-slate-500">
                  Showing {formatNumber(paginated.length)} of {formatNumber(filtered.length)} issues
                </p>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* IssueRow                                                                    */
/* -------------------------------------------------------------------------- */

function IssueRow({
  issue,
  expanded,
  onToggle,
}: {
  issue: Issue;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severityStyle = getSeverityStyle(issue.severity);

  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="font-mono text-xs text-slate-400">#{issue.pr_id}</TableCell>
        <TableCell>{toTitleCase(issue.issue_type)}</TableCell>
        <TableCell>
          <Badge dotClassName={severityStyle.dotClass} className={severityStyle.badgeClass}>
            {toTitleCase(issue.severity)}
          </Badge>
        </TableCell>
        <TableCell className="max-w-md truncate text-slate-300">{issue.explanation}</TableCell>
        <TableCell className="text-right">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            {expanded ? "Hide" : "View"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </TableCell>
      </TableRow>

      {expanded && (
        <tr>
          <td colSpan={5} className="bg-white/[0.02] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Explanation
                </p>
                <p className="text-sm text-slate-300">{issue.explanation}</p>
              </div>
              <div className="flex-1 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Suggested Fix
                </p>
                <p className="text-sm text-slate-300">{issue.suggestion}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
