/**
 * Type definitions for the ReviewIQ backend API.
 *
 * These interfaces mirror the existing FastAPI response schemas exactly.
 * Do not add fields that are not returned by the backend.
 */

/* -------------------------------------------------------------------------- */
/* GET /api/summary                                                            */
/* -------------------------------------------------------------------------- */

export interface SummaryResponse {
  total_prs: number;
  unique_contributors: number;
  avg_merge_hours: number;
  avg_pr_size: number;
  total_additions: number;
  total_deletions: number;
  bottleneck_count: number;
}

/* -------------------------------------------------------------------------- */
/* GET /api/contributors                                                       */
/* -------------------------------------------------------------------------- */

export interface Contributor {
  author: string;
  pr_count: number;
  avg_merge_hours: number;
  avg_pr_size: number;
  total_additions: number;
  total_deletions: number;
}

export type ContributorsResponse = Contributor[];

/* -------------------------------------------------------------------------- */
/* GET /api/issues                                                             */
/* -------------------------------------------------------------------------- */

export type IssueSeverity = string;
export type IssueType = string;

export interface Issue {
  pr_id: number;
  issue_type: IssueType;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
}

export type IssuesResponse = Issue[];

/* -------------------------------------------------------------------------- */
/* GET /api/issues/summary                                                     */
/* -------------------------------------------------------------------------- */

export interface IssuesSummaryResponse {
  total: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/* GET /api/bottlenecks                                                        */
/* -------------------------------------------------------------------------- */

export interface Bottleneck {
  github_id: number;
  title: string;
  author: string;
  merge_duration_hours: number;
  total_changes: number;
}

export type BottlenecksResponse = Bottleneck[];

/* -------------------------------------------------------------------------- */
/* POST /api/predict                                                           */
/* -------------------------------------------------------------------------- */

export interface PredictRequest {
  explanation: string;
  suggestion: string;
}

export interface PredictResponse {
  predicted_class: string;
  confidence: number;
  class_probs: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/* GET /health                                                                 */
/* -------------------------------------------------------------------------- */

export interface HealthResponse {
  status: string;
}

/* -------------------------------------------------------------------------- */
/* Shared async state helper types                                            */
/* -------------------------------------------------------------------------- */

/**
 * Generic shape returned by data-fetching hooks built on top of useApi.
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
