import logging
import sys
import os
from datetime import datetime

# This ensures Python can find all modules from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ingestion.pr_fetcher import fetch_pr_diff
from pipeline.llm_reviewer import review_diff_with_llm
from db.database import init_db, get_session
from db.models import PullRequest, PRIssue
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


def run_pipeline(limit: int = 10):
    """
    For each PR in the database (up to limit):
    1. Fetch its diff from GitHub
    2. Send to Groq (Llama 3) for review
    3. Store issues in pr_issues table
    """
    engine = init_db()
    session = get_session(engine)

    # Get PRs already reviewed so we don't repeat
    reviewed_pr_ids = session.query(PRIssue.github_pr_id).distinct().all()
    reviewed_pr_ids = {r[0] for r in reviewed_pr_ids}

    prs = session.query(PullRequest).all()
    unreviewed = [pr for pr in prs if pr.github_id not in reviewed_pr_ids]

    logger.info(f"Total PRs: {len(prs)} | Already reviewed: {len(reviewed_pr_ids)} | To process: {min(limit, len(unreviewed))}")

    processed   = 0
    total_issues = 0

    for pr in unreviewed[:limit]:
        logger.info(f"Processing PR #{pr.github_id}: {pr.title[:60]}")

        # Step 1: Fetch diff from GitHub
        diff = fetch_pr_diff(pr.repo_name, pr.github_id)

        if not diff:
            logger.warning(f"  No diff found for PR #{pr.github_id} — skipping")
            continue

        # Step 2: Send to LLM
        issues = review_diff_with_llm(diff, pr.title)

        # Step 3: Store each issue in database
        for issue_data in issues:
            issue = PRIssue(
                pull_request_id = pr.id,
                github_pr_id    = pr.github_id,
                issue_type      = issue_data["issue_type"],
                severity        = issue_data["severity"],
                explanation     = issue_data["explanation"],
                suggestion      = issue_data["suggestion"],
                created_at      = datetime.utcnow()
            )
            session.add(issue)

        session.commit()
        total_issues += len(issues)
        processed    += 1
        logger.info(f"  Stored {len(issues)} issues for PR #{pr.github_id}")

    session.close()
    logger.info(f"Pipeline complete — processed {processed} PRs, found {total_issues} total issues")


if __name__ == "__main__":
    run_pipeline(limit=10)