import logging
from datetime import datetime
from ingestion.github_client import get_client, safe_request

logger = logging.getLogger(__name__)


def fetch_pull_requests(repo_name: str, limit: int = 100) -> list[dict]:
    """
    Fetch merged pull requests from a public GitHub repository.
    
    Args:
        repo_name: e.g. "django/django" or "psf/requests"
        limit: number of PRs to fetch (start with 100)
    
    Returns:
        List of PR dictionaries ready to store in DB
    """
    client = get_client()
    
    logger.info(f"Fetching PRs from repo: {repo_name}")
    repo = safe_request(client.get_repo, repo_name)
    
    if repo is None:
        logger.error(f"Could not fetch repo: {repo_name}")
        return []

    pull_requests = []
    fetched = 0

    prs = repo.get_pulls(state="closed", sort="updated", direction="desc")

    for pr in prs:
        if fetched >= limit:
            break
        
        # Only store merged PRs, skip closed-without-merge
        if not pr.merged:
            continue

        pr_data = {
            "github_id":       pr.number,
            "repo_name":       repo_name,
            "title":           pr.title,
            "author":          pr.user.login if pr.user else "unknown",
            "state":           "merged",
            "additions":       pr.additions,
            "deletions":       pr.deletions,
            "changed_files":   pr.changed_files,
            "review_comments": pr.review_comments,
            "created_at":      pr.created_at,
            "merged_at":       pr.merged_at,
        }

        pull_requests.append(pr_data)
        fetched += 1
        logger.info(f"  [{fetched}/{limit}] Fetched PR #{pr.number}: {pr.title[:60]}")

    logger.info(f"Done. Total PRs fetched: {len(pull_requests)}")
    return pull_requests
def fetch_pr_diff(repo_name: str, pr_number: int) -> str:
    """
    Fetch the raw code diff for a specific PR.
    Returns the diff as a string, truncated to 3000 chars
    to stay within LLM context limits.
    """
    client = get_client()
    repo = safe_request(client.get_repo, repo_name)

    if repo is None:
        logger.error(f"Could not fetch repo: {repo_name}")
        return ""

    pr = safe_request(repo.get_pull, pr_number)

    if pr is None:
        logger.error(f"Could not fetch PR #{pr_number}")
        return ""

    # Collect diff from all changed files
    diff_parts = []
    for file in pr.get_files():
        if file.patch:  # patch is None for binary files
            diff_parts.append(
                f"### File: {file.filename}\n{file.patch}"
            )

    full_diff = "\n\n".join(diff_parts)

    # Truncate to 3000 chars
    if len(full_diff) > 3000:
        full_diff = full_diff[:3000] + "\n... [truncated]"

    logger.info(f"Fetched diff for PR #{pr_number} ({len(full_diff)} chars)")
    return full_diff