from pipeline.analytics import (
    load_prs_as_dataframe,
    get_contributor_stats,
    get_pr_size_distribution,
    get_daily_activity,
    get_review_bottlenecks,
    get_summary_metrics
)

print("Loading data...")
df = load_prs_as_dataframe()
print(f"DataFrame shape: {df.shape}")
print(f"Columns: {list(df.columns)}\n")

print("=== Summary Metrics ===")
metrics = get_summary_metrics(df)
for k, v in metrics.items():
    print(f"  {k}: {v}")

print("\n=== Top Contributors ===")
print(get_contributor_stats(df).to_string(index=False))

print("\n=== PR Size Distribution ===")
print(get_pr_size_distribution(df).to_string(index=False))

print("\n=== Daily Activity ===")
print(get_daily_activity(df).to_string(index=False))

print("\n=== Bottleneck PRs (>24h to merge) ===")
bn = get_review_bottlenecks(df)
print(f"  Found {len(bn)} bottleneck PRs")
print(bn.head(3).to_string(index=False))