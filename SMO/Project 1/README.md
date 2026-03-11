# SMO Incident Dashboard

A Streamlit dashboard that reads `incident.csv` and the last three columns of `Dashboard Metrics Tracker for SMO.xlsx` to auto-generate filters, summary KPIs, and tables/charts.

## How it works
- The Excel's last three columns are interpreted as:
  1. `metric_column`: name of a column in `incident.csv` to summarize
  2. `filters`: comma/semicolon separated list of column names in `incident.csv` used as sidebar filters
  3. `tables`: comma/semicolon separated list of tab names to place the metric (e.g., `Overview, SLA`)
- If files are not present in the same folder, the app lets you upload them from the sidebar.

## Requirements
- Python 3.9+
- Windows PowerShell or terminal

## Setup
```bash
# From the SMO folder
pip install -r requirements.txt

# Run the app
streamlit run streamlit_app.py
```

## File locations
Place these files beside `streamlit_app.py` or use the uploaders:
- `incident.csv`
- `Dashboard Metrics Tracker for SMO.xlsx`

## Notes
- Filters are automatically built from all `filters` mentioned across rows in the Excel.
- Each `metric_column` renders a frequency table and a bar chart.
- Unknown columns referenced in the Excel are highlighted with a warning.
