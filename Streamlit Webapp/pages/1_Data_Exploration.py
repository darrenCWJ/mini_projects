import streamlit as st

st.set_page_config(page_title="Data Exploration",
                   page_icon="📈",
                   layout = 'wide')

st.markdown("# Plotting Graph from API")
st.sidebar.header("Plotting Graph from API")

st.write('This page pulls API from singapore dataset and display the information')