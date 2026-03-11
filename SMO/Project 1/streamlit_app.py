import os
from typing import List, Dict, Tuple

import pandas as pd
import streamlit as st


def load_incident_csv(default_path: str) -> pd.DataFrame:
    if os.path.exists(default_path):
        # Try different encodings to handle various CSV formats
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        for encoding in encodings:
            try:
                return pd.read_csv(default_path, encoding=encoding)
            except UnicodeDecodeError:
                continue
        # If all encodings fail, try with error handling
        try:
            return pd.read_csv(default_path, encoding='utf-8', errors='replace')
        except Exception as e:
            st.error(f"Could not read CSV file: {e}")
            return pd.DataFrame()
    
    uploaded = st.sidebar.file_uploader("Upload incident CSV", type=["csv"], key="incident_csv")
    if uploaded is not None:
        try:
            return pd.read_csv(uploaded)
        except UnicodeDecodeError:
            # Try with different encoding for uploaded files
            try:
                return pd.read_csv(uploaded, encoding='latin-1')
            except Exception as e:
                st.error(f"Could not read uploaded CSV file: {e}")
                return pd.DataFrame()
    st.info("Waiting for incident data. Place 'incident.csv' next to the app or upload it.")
    return pd.DataFrame()


def load_metrics_spec_xlsx(default_path: str) -> pd.DataFrame:
    if os.path.exists(default_path):
        try:
            df = pd.read_excel(default_path, engine="openpyxl")
        except Exception:
            # Fallback without engine if not available
            df = pd.read_excel(default_path)
    else:
        uploaded = st.sidebar.file_uploader(
            "Upload Dashboard Metrics Tracker (Excel)", type=["xlsx", "xls"], key="metrics_xlsx"
        )
        if uploaded is None:
            st.info(
                "Waiting for metrics tracker. Place 'Dashboard Metrics Tracker for SMO.xlsx' next to the app or upload it."
            )
            return pd.DataFrame()
        try:
            df = pd.read_excel(uploaded, engine="openpyxl")
        except Exception:
            df = pd.read_excel(uploaded)

    # Drop fully empty columns/rows and keep only the last three columns per user spec
    df = df.dropna(how="all")
    # Remove columns that are entirely NaN
    df = df.dropna(axis=1, how="all")
    if df.shape[1] >= 3:
        last_three = df.columns[-3:]
        df = df[last_three].copy()
        # Normalize column names
        rename_map = {
            last_three[-3]: "metric_column",
            last_three[-2]: "filters",
            last_three[-1]: "tables",
        }
        df = df.rename(columns=rename_map)
    else:
        # If not enough columns, return empty and let UI guide the user
        return pd.DataFrame(columns=["metric_column", "filters", "tables"]) 

    # Ensure text types for parsing
    for col in ["metric_column", "filters", "tables"]:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna("").str.strip()

    # Remove rows that don't specify a metric column
    df = df[df["metric_column"] != ""]
    return df


def parse_list_cell(cell_value: str) -> List[str]:
    if not isinstance(cell_value, str) or not cell_value.strip():
        return []
    # Split on comma or semicolon, trim whitespace, drop empties
    items = [item.strip() for item in cell_value.replace(";", ",").split(",")]
    return [item for item in items if item]


def derive_filter_columns(spec_df: pd.DataFrame) -> List[str]:
    filters: List[str] = []
    if "filters" in spec_df.columns:
        for raw in spec_df["filters"].tolist():
            filters.extend(parse_list_cell(raw))
    # Preserve order but deduplicate
    seen: Dict[str, bool] = {}
    ordered_unique = []
    for f in filters:
        key = f.lower()
        if key not in seen:
            seen[key] = True
            ordered_unique.append(f)
    return ordered_unique


def apply_sidebar_filters(df: pd.DataFrame, filter_columns: List[str]) -> Tuple[pd.DataFrame, Dict[str, List[str]]]:
    if df.empty or not filter_columns:
        return df, {}
    active_filters: Dict[str, List[str]] = {}
    filtered = df.copy()
    with st.sidebar:
        st.subheader("Filters")
        for col in filter_columns:
            if col not in filtered.columns:
                continue
            values = sorted([v for v in filtered[col].dropna().unique()])
            default = values  # Select all by default
            selection = st.multiselect(f"{col}", values, default=default, key=f"filter_{col}")
            if selection and len(selection) < len(values):
                filtered = filtered[filtered[col].isin(selection)]
            active_filters[col] = selection
    return filtered, active_filters


def render_kpis(df: pd.DataFrame) -> None:
    st.subheader("Overview")
    if df.empty:
        st.info("No data to summarize.")
        return
    total_incidents = len(df)
    cols = st.columns(3)
    cols[0].metric("Total Incidents", f"{total_incidents:,}")

    # Common optional breakdowns
    if "Priority" in df.columns:
        high = (df["Priority"].astype(str).str.lower() == "high").sum()
        cols[1].metric("High Priority", f"{high:,}")
    else:
        cols[1].metric("Distinct Priorities", df.get("Priority", pd.Series(dtype=object)).nunique())
    if "Status" in df.columns:
        open_cnt = (df["Status"].astype(str).str.lower().isin(["open", "new", "in progress"]).sum())
        cols[2].metric("Open-ish Status", f"{open_cnt:,}")
    else:
        cols[2].metric("Distinct Statuses", df.get("Status", pd.Series(dtype=object)).nunique())


def render_tables_and_charts(df: pd.DataFrame, spec_df: pd.DataFrame) -> None:
    if df.empty or spec_df.empty:
        st.info("Provide both incident data and a valid metrics spec to render tables.")
        return

    # Build tabs by distinct table names across the spec
    table_to_rows: Dict[str, pd.DataFrame] = {}
    for _, row in spec_df.iterrows():
        metric_col = row.get("metric_column", "")
        for table_name in parse_list_cell(row.get("tables", "")) or ["Dashboard"]:
            table_to_rows.setdefault(table_name, pd.DataFrame(columns=spec_df.columns))

    if not table_to_rows:
        table_to_rows["Dashboard"] = spec_df
    else:
        # Assign rows to tables
        assignments: Dict[str, List[int]] = {t: [] for t in table_to_rows.keys()}
        for idx, row in spec_df.iterrows():
            targets = parse_list_cell(row.get("tables", "")) or ["Dashboard"]
            for t in targets:
                assignments.setdefault(t, []).append(idx)
        for t, idxs in assignments.items():
            if idxs:
                table_to_rows[t] = spec_df.loc[idxs]
            else:
                table_to_rows[t] = pd.DataFrame(columns=spec_df.columns)

    tab_labels = list(table_to_rows.keys())
    tabs = st.tabs(tab_labels)
    for tab, label in zip(tabs, tab_labels):
        with tab:
            rows = table_to_rows[label]
            if rows.empty:
                st.info("No metrics configured for this table.")
                continue
            for _, r in rows.iterrows():
                metric_col = r.get("metric_column", "")
                if metric_col not in df.columns:
                    st.warning(f"Metric column '{metric_col}' not found in incident data.")
                    continue
                st.markdown(f"**Metric: {metric_col}**")
                counts = df[metric_col].fillna("(Missing)").astype(str).value_counts().rename_axis(metric_col).reset_index(name="Count")
                st.dataframe(counts, use_container_width=True)
                st.bar_chart(counts.set_index(metric_col))


def main() -> None:
    st.set_page_config(page_title="SMO Incident Dashboard", layout="wide")
    st.title("SMO Incident Dashboard")
    st.caption("Auto-generated from Dashboard Metrics Tracker (last 3 columns) and incident.csv")

    default_csv = os.path.join(os.path.dirname(__file__), "incident.csv")
    default_xlsx = os.path.join(os.path.dirname(__file__), "Dashboard Metrics Tracker for SMO.xlsx")

    with st.sidebar.expander("Data Sources", expanded=True):
        st.write("Using local files if present; you can also upload alternatives below.")

    incident_df = load_incident_csv(default_csv)
    spec_df = load_metrics_spec_xlsx(default_xlsx)

    if not incident_df.empty:
        st.success(f"Loaded incident data: {len(incident_df):,} rows, {incident_df.shape[1]} columns")
        with st.expander("Preview incident data", expanded=False):
            st.dataframe(incident_df.head(50), use_container_width=True)
    if not spec_df.empty:
        st.success(f"Loaded metrics spec: {len(spec_df):,} rows")
        with st.expander("Preview metrics spec (normalized)", expanded=False):
            st.dataframe(spec_df, use_container_width=True)

    filter_columns = derive_filter_columns(spec_df) if not spec_df.empty else []
    filtered_df, active_filters = apply_sidebar_filters(incident_df, filter_columns)

    render_kpis(filtered_df)
    render_tables_and_charts(filtered_df, spec_df)

    with st.sidebar:
        if active_filters:
            st.caption("Active filters:")
            for k, v in active_filters.items():
                if v:
                    st.caption(f"- {k}: {', '.join(map(str, v))}")


if __name__ == "__main__":
    main()


