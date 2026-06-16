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
      .catch((err) => {
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

export function useSummary() {
  return useApi(useCallback(() => getSummary(), []));
}

export function useContributors() {
  return useApi(useCallback(() => getContributors(), []));
}

export function useIssues() {
  return useApi(useCallback(() => getIssues(), []));
}

export function useIssuesSummary() {
  return useApi(useCallback(() => getIssuesSummary(), []));
}

export function useBottlenecks() {
  return useApi(useCallback(() => getBottlenecks(), []));
}

export function useHealth() {
  return useApi(useCallback(() => getHealth(), []));
}

export function usePredict() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (payload) => {
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
