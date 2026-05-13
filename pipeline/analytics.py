import pandas as pd
import logging
from db.database import init_db, get_session
from db.models import PullRequest

logger = logging.getLogger(__name__)


def load_prs_as_dataframe() -> pd.DataFrame:
    """
    Load all pull requests from the database into a Pandas DataFrame.
    This is the foundation for every analytics function below.
    """
    engine = init_db()
    session = get_session(engine)

    prs = session.query(PullRequest).all()
    session.close()

    data = [{
        "github_id":       pr.github_id,
        "repo_name":       pr.repo_name,
        "title":           pr.title,
        "author":          pr.author,
        "additions":       pr.additions,
        "deletions":       pr.deletions,
        "changed_files":   pr.changed_files,
        "review_comments": pr.review_comments,
        "created_at":      pr.created_at,
        "merged_at":       pr.merged_at,
    } for pr in prs]

    df = pd.DataFrame(data)

    # Calculate merge duration in hours — this is a key metric
    df["merge_duration_hours"] = (
        df["merged_at"] - df["created_at"]
    ).dt.total_seconds() / 3600

    # Total lines changed per PR
    df["total_changes"] = df["additions"] + df["deletions"]

    # Day of week the PR was created (0=Monday, 6=Sunday)
    df["day_of_week"] = df["created_at"].dt.day_name()

    logger.info(f"Loaded {len(df)} PRs into DataFrame")
    return df


def get_contributor_stats(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns per-author PR count, avg merge time, avg PR size.
    Answers: who contributes most and how fast do their PRs merge?
    """
    stats = df.groupby("author").agg(
        pr_count        =("github_id", "count"),
        avg_merge_hours =("merge_duration_hours", "mean"),
        avg_pr_size     =("total_changes", "mean"),
        total_additions =("additions", "sum"),
        total_deletions =("deletions", "sum"),
    ).reset_index()

    stats = stats.sort_values("pr_count", ascending=False)
    stats["avg_merge_hours"] = stats["avg_merge_hours"].round(1)
    stats["avg_pr_size"] = stats["avg_pr_size"].round(0)

    return stats


def get_pr_size_distribution(df: pd.DataFrame) -> pd.DataFrame:
    """
    Categorise PRs by size: Small / Medium / Large / Huge.
    Answers: what does the typical PR look like in this repo?
    """
    def categorise(changes):
        if changes < 50:    return "Small (<50 lines)"
        if changes < 200:   return "Medium (50-200)"
        if changes < 500:   return "Large (200-500)"
        return "Huge (500+)"

    df["size_category"] = df["total_changes"].apply(categorise)
    return df["size_category"].value_counts().reset_index()


def get_daily_activity(df: pd.DataFrame) -> pd.DataFrame:
    """
    PR count by day of week.
    Answers: when is this repo most active?
    """
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    activity = df["day_of_week"].value_counts().reindex(order, fill_value=0).reset_index()
    activity.columns = ["day", "pr_count"]
    return activity


def get_review_bottlenecks(df: pd.DataFrame) -> pd.DataFrame:
    """
    PRs that took longer than 24 hours to merge — potential bottlenecks.
    Answers: which PRs were slow and who authored them?
    """
    bottlenecks = df[df["merge_duration_hours"] > 24].copy()
    bottlenecks = bottlenecks[["github_id", "title", "author", "merge_duration_hours", "total_changes"]]
    bottlenecks = bottlenecks.sort_values("merge_duration_hours", ascending=False)
    bottlenecks["merge_duration_hours"] = bottlenecks["merge_duration_hours"].round(1)
    return bottlenecks


def get_summary_metrics(df: pd.DataFrame) -> dict:
    """
    Top-level numbers for the dashboard header cards.
    """
    return {
        "total_prs":          len(df),
        "unique_contributors": df["author"].nunique(),
        "avg_merge_hours":    round(df["merge_duration_hours"].mean(), 1),
        "avg_pr_size":        round(df["total_changes"].mean(), 0),
        "total_additions":    int(df["additions"].sum()),
        "total_deletions":    int(df["deletions"].sum()),
        "bottleneck_count":   int((df["merge_duration_hours"] > 24).sum()),
    }