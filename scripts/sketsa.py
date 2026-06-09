import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import streamlit_shadcn_ui as ui
import plotly.graph_objects as go
import plotly.express as px
import re
from wordcloud import WordCloud
from streamlit_echarts import st_echarts
from io import BytesIO

# === Konfigurasi dasar ===
st.set_page_config(
    # Title and icon for the browser's tab bar:
    page_title="Dashboard Analisis Persepsi",
    page_icon="logoiknnotext.png",
    # Make the content take up the width of the page:
    layout="wide",
)

st.logo("logoiknnotext.png", size="large") # ganti dengan path logo
st.markdown(
    """
    <div style="text-align: center;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Logo_of_Ibu_Kota_Nusantara.svg" alt="Logo IKN" width="280" style="margin-bottom: 8px;">
        <h1 style="color: #2c3e50; font-size: 38px; font-weight: 700;">
            Dashboard Analisis Persepsi Masyarakat di Sosial Media
        </h1>
        <hr style="width: 100%; margin: 20px auto; border: 1px solid #ddd;">
    </div>
    """,
    unsafe_allow_html=True
)