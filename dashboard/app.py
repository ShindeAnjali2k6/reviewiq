import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import streamlit as st
import plotly.express as px
import pandas as pd
from pipeline.analytics import (
    load_prs_as_dataframe,
    get_contributor_stats,
    get_pr_size_distribution,
    get_daily_activity,
    get_review_bottlenecks,
    get_summary_metrics
)

# ── Page config ──────────────────────────────────────────────
st.set_page_config(
    page_title="ReviewIQ — PR Analytics",
    page_icon="🔍",
    layout="wide"
)

# ── Load data ─────────────────────────────────────────────────
@st.cache_data
def load_data():
    return load_prs_as_dataframe()

df = load_data()
metrics = get_summary_metrics(df)

# ── Header ────────────────────────────────────────────────────
st.title("🔍 ReviewIQ — Pull Request Analytics")
st.caption("Analysing real PR data from `psf/requests` · Built with GitHub API + Python + Streamlit")
st.divider()

# ── Summary metric cards ──────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total PRs Analysed",    metrics["total_prs"])
col2.metric("Unique Contributors",   metrics["unique_contributors"])
col3.metric("Avg Merge Time",        f"{metrics['avg_merge_hours']}h")
col4.metric("Bottleneck PRs",        metrics["bottleneck_count"],
            delta=f"{metrics['bottleneck_count']} took >24h",
            delta_color="inverse")

st.divider()

# ── Row 1: Contributor activity + PR size distribution ────────
col_left, col_right = st.columns(2)

with col_left:
    st.subheader("👤 Top Contributors by PR Count")
    contrib = get_contributor_stats(df)
    fig1 = px.bar(
        contrib.head(10),
        x="author", y="pr_count",
        color="avg_merge_hours",
        color_continuous_scale="Blues",
        labels={"pr_count": "PRs Merged", "author": "Contributor",
                "avg_merge_hours": "Avg Merge Time (h)"},
        title="PRs per contributor (colour = avg merge time)"
    )
    fig1.update_layout(showlegend=False, height=350)
    st.plotly_chart(fig1, use_container_width=True)

with col_right:
    st.subheader("📦 PR Size Distribution")
    size_df = get_pr_size_distribution(df)
    fig2 = px.pie(
        size_df,
        names="size_category", values="count",
        color_discrete_sequence=px.colors.sequential.Blues_r,
        title="Distribution of PR sizes by lines changed"
    )
    fig2.update_layout(height=350)
    st.plotly_chart(fig2, use_container_width=True)

# ── Row 2: Daily activity + merge time histogram ──────────────
col_left2, col_right2 = st.columns(2)

with col_left2:
    st.subheader("📅 PR Activity by Day of Week")
    activity = get_daily_activity(df)
    fig3 = px.bar(
        activity,
        x="day", y="pr_count",
        color="pr_count",
        color_continuous_scale="Blues",
        labels={"pr_count": "PRs Created", "day": "Day"},
        title="When are PRs opened most?"
    )
    fig3.update_layout(showlegend=False, height=350)
    st.plotly_chart(fig3, use_container_width=True)

with col_right2:
    st.subheader("⏱️ Merge Time Distribution")
    # Filter out extreme outlier (magsen's 21324h PR) for cleaner chart
    df_filtered = df[df["merge_duration_hours"] < 500]
    fig4 = px.histogram(
        df_filtered,
        x="merge_duration_hours",
        nbins=20,
        color_discrete_sequence=["#1f77b4"],
        labels={"merge_duration_hours": "Hours to Merge"},
        title="How long do PRs take to merge? (outliers excluded)"
    )
    fig4.update_layout(height=350)
    st.plotly_chart(fig4, use_container_width=True)

# ── Row 3: Bottleneck PRs table ───────────────────────────────
st.divider()
st.subheader("🚨 Review Bottlenecks — PRs that took longer than 24h to merge")
bottlenecks = get_review_bottlenecks(df)

if len(bottlenecks) > 0:
    st.dataframe(
        bottlenecks.rename(columns={
            "github_id":            "PR #",
            "title":                "Title",
            "author":               "Author",
            "merge_duration_hours": "Hours to Merge",
            "total_changes":        "Lines Changed"
        }),
        use_container_width=True,
        hide_index=True
    )
else:
    st.success("No bottleneck PRs found — this repo merges fast!")

# ── Row 4: Raw data explorer ──────────────────────────────────
st.divider()
with st.expander("🔎 Explore raw PR data"):
    st.dataframe(
        df[["github_id", "title", "author", "additions",
            "deletions", "merge_duration_hours", "day_of_week"]],
        use_container_width=True,
        hide_index=True
    )

st.caption("ReviewIQ · Built by Anjali Shinde · Data source: GitHub REST API")