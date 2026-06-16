/**
 * Consolidated data-fetching hooks for the ReviewIQ frontend.
 *
 * Contains a generic `useApi` hook plus one typed hook per backend
 * endpoint. All hooks consume the real FastAPI backend via services/api.ts.
 * No mock data is used anywhere in this file.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSummary,
  getContributors,
  getIssues,
  getIssuesSummary,
  getBottlenecks,
  postPredict,
  getHealth,
} from "../services/api";
import { getErrorMessage } from "../lib/utils";
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

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(fetcher: () => Promise<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const [reloadToken, setReloadToken] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!isMounted.current) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted.current) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!isMounted.current) return;
        setLoading(false);
      });

    return () => {
      isMounted.current = false;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, loading, error, refetch };
}

export function useSummary(): UseApiResult<SummaryResponse> {
  return useApi<SummaryResponse>(useCallback(() => getSummary(), []));
}

export function useContributors(): UseApiResult<ContributorsResponse> {
  return useApi<ContributorsResponse>(useCallback(() => getContributors(), []));
}

export function useIssues(): UseApiResult<IssuesResponse> {
  return useApi<IssuesResponse>(useCallback(() => getIssues(), []));
}

export function useIssuesSummary(): UseApiResult<IssuesSummaryResponse> {
  return useApi<IssuesSummaryResponse>(useCallback(() => getIssuesSummary(), []));
}

export function useBottlenecks(): UseApiResult<BottlenecksResponse> {
  return useApi<BottlenecksResponse>(useCallback(() => getBottlenecks(), []));
}

export function useHealth(): UseApiResult<HealthResponse> {
  return useApi<HealthResponse>(useCallback(() => getHealth(), []));
}

export interface UsePredictResult {
  data: PredictResponse | null;
  loading: boolean;
  error: string | null;
  predict: (payload: PredictRequest) => Promise<void>;
  reset: () => void;
}

export function usePredict(): UsePredictResult {
  const [data, setData] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (payload: PredictRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postPredict(payload);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, predict, reset };
}

/**
 * @param fetcher - async function that returns the typed response.
 *   Should be stable (e.g. wrapped in useCallback) or a plain function
 *   reference, to avoid unnecessary refetch loops.
 * @param deps - dependency array; the fetcher re-runs when these change.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: ReadonlyArray<unknown> = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track mount state to avoid setting state on unmounted components.
  const isMounted = useRef(true);

  // Allows manual refetches without changing the dependency array.
  const [reloadToken, setReloadToken] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!isMounted.current) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted.current) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!isMounted.current) return;
        setLoading(false);
      });

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, loading, error, refetch };
}
