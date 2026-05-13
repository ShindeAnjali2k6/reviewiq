import os
import time
import logging
from github import Github, RateLimitExceededException
from dotenv import load_dotenv

load_dotenv()

# Set up logging — this replaces all print() statements
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)


def get_client() -> Github:
    """Create and return an authenticated GitHub client."""
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN is not set. Check your .env file.")
    logger.info("GitHub client initialized successfully.")
    return Github(token)


def safe_request(func, *args, retries: int = 3):
    """
    Wraps any GitHub API call with retry logic for rate limits.
    Retries up to 3 times before giving up.
    """
    for attempt in range(retries):
        try:
            return func(*args)
        except RateLimitExceededException:
            wait = 60 * (attempt + 1)
            logger.warning(f"Rate limit hit. Waiting {wait}s before retry {attempt + 1}/{retries}...")
            time.sleep(wait)
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
            if attempt == retries - 1:
                raise
    return None