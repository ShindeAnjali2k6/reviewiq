/**
 * Centralized Axios client and typed API functions for the ReviewIQ backend.
 *
 * All requests go through a single configured Axios instance so that
 * base URL, timeouts, and error handling stay consistent across the app.
 *
 * IMPORTANT: This file must only call endpoints that exist on the
 * existing FastAPI backend. Do not add new endpoints here.
 */

import axios, { type AxiosInstance } from "axios";
import type {
  SummaryResponse,
  ContributorsResponse,
  IssuesResponse,
  IssuesSummaryResponse,
  BottlenecksResponse,
  PredictRequest,
  PredictResponse,
  HealthResponse,
} from "../types/api.types";

/**
 * Base URL for the FastAPI backend.
 * Configure via VITE_API_BASE_URL in a .env file, e.g.:
 *   VITE_API_BASE_URL=http://localhost:8000
 */
const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------------------------------------------------------------- */
/* Endpoint functions                                                          */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/summary
 * High-level aggregate metrics across all ingested pull requests.
 */
export async function getSummary(): Promise<SummaryResponse> {
  const { data } = await apiClient.get<SummaryResponse>("/api/summary");
  return data;
}

/**
 * GET /api/contributors
 * Per-contributor productivity and merge-time statistics.
 */
export async function getContributors(): Promise<ContributorsResponse> {
  const { data } = await apiClient.get<ContributorsResponse>("/api/contributors");
  return data;
}

/**
 * GET /api/issues
 * Flat list of detected issues across analyzed pull requests.
 */
export async function getIssues(): Promise<IssuesResponse> {
  const { data } = await apiClient.get<IssuesResponse>("/api/issues");
  return data;
}

/**
 * GET /api/issues/summary
 * Aggregated issue counts by type and severity.
 */
export async function getIssuesSummary(): Promise<IssuesSummaryResponse> {
  const { data } = await apiClient.get<IssuesSummaryResponse>("/api/issues/summary");
  return data;
}

/**
 * GET /api/bottlenecks
 * Pull requests flagged as merge-time bottlenecks.
 */
export async function getBottlenecks(): Promise<BottlenecksResponse> {
  const { data } = await apiClient.get<BottlenecksResponse>("/api/bottlenecks");
  return data;
}

/**
 * POST /api/predict
 * Runs the ML classifier on a given explanation/suggestion pair.
 */
export async function postPredict(payload: PredictRequest): Promise<PredictResponse> {
  const { data } = await apiClient.post<PredictResponse>("/api/predict", payload);
  return data;
}

/**
 * GET /health
 * Basic API liveness check.
 */
export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}
