import logging
from ingestion.pr_fetcher import fetch_pull_requests
from db.database import init_db, get_session
from db.models import PullRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    # Step 1: Set up database
    engine = init_db()
    session = get_session(engine)

    # Step 2: Fetch PRs from a real repo
    repo = "psf/requests"          # change this to any public repo
    prs = fetch_pull_requests(repo, limit=50)

    # Step 3: Save to database (skip duplicates)
    saved = 0
    skipped = 0

    for pr_data in prs:
        exists = session.query(PullRequest).filter_by(
            github_id=pr_data["github_id"]
        ).first()

        if exists:
            skipped += 1
            continue

        pr = PullRequest(**pr_data)
        session.add(pr)
        saved += 1

    session.commit()
    session.close()

    logger.info(f"Ingestion complete — saved: {saved}, skipped (duplicates): {skipped}")

    # Step 4: Quick verification query
    verify_session = get_session(engine)
    count = verify_session.query(PullRequest).count()
    sample = verify_session.query(PullRequest).first()
    verify_session.close()

    logger.info(f"Total PRs in database: {count}")
    if sample:
        logger.info(f"Sample record: {sample}")


if __name__ == "__main__":
    main()