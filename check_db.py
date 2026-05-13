from db.database import init_db, get_session
from db.models import PullRequest

engine = init_db()
session = get_session(engine)

total = session.query(PullRequest).count()
print(f"\n✅ Total PRs in database: {total}")

prs = session.query(PullRequest).limit(5).all()
print("\n📋 First 5 PRs:")
for pr in prs:
    print(f"  PR #{pr.github_id} | {pr.author} | {pr.title[:50]} | merged: {pr.merged_at}")

authors = session.query(PullRequest.author).distinct().count()
print(f"\n👤 Unique contributors: {authors}")

session.close()