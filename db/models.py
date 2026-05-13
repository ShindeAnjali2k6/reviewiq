from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class PullRequest(Base):
    """Represents a single merged pull request stored in the database."""
    __tablename__ = "pull_requests"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    github_id       = Column(BigInteger, unique=True, nullable=False)
    repo_name       = Column(String, nullable=False)
    title           = Column(String)
    author          = Column(String)
    state           = Column(String, default="merged")
    additions       = Column(Integer, default=0)
    deletions       = Column(Integer, default=0)
    changed_files   = Column(Integer, default=0)
    review_comments = Column(Integer, default=0)
    created_at      = Column(DateTime)
    merged_at       = Column(DateTime, nullable=True)

    issues = relationship("PRIssue", back_populates="pull_request")

    def __repr__(self):
        return f"<PR #{self.github_id} by {self.author} in {self.repo_name}>"


class PRIssue(Base):
    """Represents a single code issue detected by the LLM."""
    __tablename__ = "pr_issues"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    pull_request_id = Column(Integer, ForeignKey("pull_requests.id"), nullable=False)
    github_pr_id    = Column(BigInteger, nullable=False)
    issue_type      = Column(String)
    severity        = Column(String)
    explanation     = Column(String)
    suggestion      = Column(String)
    created_at      = Column(DateTime)

    pull_request = relationship("PullRequest", back_populates="issues")

    def __repr__(self):
        return f"<Issue [{self.severity}] {self.issue_type} on PR #{self.github_pr_id}>"