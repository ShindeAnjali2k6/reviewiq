import os
import json
import logging
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def review_diff_with_llm(diff: str, pr_title: str) -> list[dict]:
    """
    Send a PR diff to Groq (Llama 3) and get back structured
    code review feedback as a list of issues.
    """
    if not diff or len(diff.strip()) < 20:
        logger.warning("Diff too short to review — skipping")
        return []

    prompt = f"""You are an expert code reviewer. Review this pull request diff and identify issues.

PR Title: {pr_title}

Diff:
{diff}

Return ONLY a JSON array of issues found. Each issue must have exactly these fields:
- issue_type: one of [security, logic, performance, style, null-safety]
- severity: one of [high, medium, low]
- explanation: one sentence describing the problem
- suggestion: one sentence describing the fix

If no issues found, return an empty array: []

Return ONLY the JSON array. No markdown, no explanation, no preamble."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1000
        )

        raw = response.choices[0].message.content.strip()
        logger.info(f"LLM response received ({len(raw)} chars)")

        # Strip markdown code fences if model adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        issues = json.loads(raw)

        valid_types    = {"security", "logic", "performance", "style", "null-safety"}
        valid_severity = {"high", "medium", "low"}
        validated = []

        for issue in issues:
            if (
                issue.get("issue_type") in valid_types and
                issue.get("severity")   in valid_severity and
                issue.get("explanation") and
                issue.get("suggestion")
            ):
                validated.append(issue)
            else:
                logger.warning(f"Skipped invalid issue: {issue}")

        logger.info(f"Found {len(validated)} valid issues")
        return validated

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e} | Raw: {raw[:200]}")
        return []
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return []