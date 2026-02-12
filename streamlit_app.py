import streamlit as st

st.set_page_config(page_title="Simu Sales Report", layout="wide")

st.title("Simu Sales Dashboard")

uploaded = st.file_uploader("Upload CSV", type="csv")

if uploaded:
    import pandas as pd
    df = pd.read_csv(uploaded)
    st.dataframe(df)
