import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import streamlit_shadcn_ui as ui
import plotly.express as px
import re
import tempfile
from wordcloud import WordCloud
from streamlit_echarts import st_echarts
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import cm
from collections import Counter, defaultdict
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from sklearn.feature_extraction.text import CountVectorizer

# === Konfig ===
st.set_page_config(
    page_title="Dashboard Analisis Persepsi",
    page_icon="logoiknnotext.png",
    layout="wide",
)

# === Load Data Langsung ===
# CSV_FILE = "tweets_ikn_labeled.csv"

@st.cache_data
def load_data():
    return pd.read_csv("tweets_ikn_labeled.csv")

try:
    df = load_data()
except FileNotFoundError:
    st.error(f"File {load_data()} tidak ditemukan. Pastikan file ada di folder yang sama dengan script.")
    st.stop()

# Pastikan kolom waktu dalam format datetime
df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
df["date"] = df["created_at"].dt.date

# === Palet warna konsisten ===
palette = {
    "Positif": "#2ecc71", # Hijau
    "Negatif": "#e74c3c", # Merah
    "Netral": "#3498db"   # Biru
}

st.sidebar.title("Menu")
page = st.sidebar.radio("**Pilih Halaman**", ["Home", "Search"])


# === Filter Interaktif ===
st.sidebar.header("Filter Data")
kategori_filter = st.sidebar.multiselect(
    "Pilih Kategori",
    df["Kategori"].unique(),
    default=df["Kategori"].unique()
)
date_range = st.sidebar.date_input(
    "Pilih Rentang Tanggal",
    [df["date"].min(), df["date"].max()]
)

filtered_df = df[
    (df["Kategori"].isin(kategori_filter)) &
    (df["date"].between(date_range[0], date_range[1]))
]

st.logo("logoiknnotext.png", size="large") # ganti dengan path logo

if page == "Home":
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

    # === Ringkasan Data ===
    tab1, tab2, tab3 = st.tabs(["📈 Dashboard", "📁 Data", "📖 Tentang Model"])
    with tab1:
        st.markdown(
            """
            <div style="text-align: center;">
                <h1 style="color: #2c3e50; font-size: 42px; margin-bottom: 10px;">
                    Ringkasan Analisis
                </h1>
            </div>
            """,
            unsafe_allow_html=True
        )
        # === Mapping kategori ke warna & emoji ===
        category_map = {
            "Positif": {"color": "green", "emoji": "😁"},
            "Negatif": {"color": "red", "emoji": "☹️"},
            "Netral": {"color": "blue", "emoji": "😐"},
        }

        # === Fungsi untuk bikin gauge ===
        def radial_gauge(value, color, emoji, label):
            option = {
                "title": {
                    "text": label,
                    "left": "center",
                    "bottom": 0,
                    "textStyle": {"fontSize": 18, "fontWeight": "bold"}
                },
                "series": [
                    {
                        "type": "gauge",
                        "startAngle": 360,
                        "endAngle": 0,
                        "progress": {"show": True, "width": 18, "itemStyle": {"color": color}},
                        "axisLine": {"lineStyle": {"width": 18, "color": [[1, "#f0f0f0"]]}},
                        "pointer": {"show": False},
                        "axisTick": {"show": False},
                        "splitLine": {"show": False},
                        "axisLabel": {"show": False},
                        "anchor": {"show": False},
                        "detail": {
                            "formatter": f"{emoji}\n{value:.2f}%",
                            "fontSize": 18,
                            "offsetCenter": [0, "0%"]
                        },
                        "data": [{"value": round(value, 2)}],
                    }
                ]
            }
            st_echarts(option, height="200px")

        # === Hitung distribusi dari df ===
        counts = filtered_df["Kategori"].value_counts(normalize=True) * 100

        # === Buat layout otomatis ===
        cols = st.columns(len(counts))

        for col, (cat, val) in zip(cols, counts.items()):
            with col:
                cfg = category_map.get(cat, {"color": "gray", "emoji": "❓"})
                radial_gauge(val, cfg["color"], cfg["emoji"], cat)   

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            ui.metric_card("Total Tweet", len(filtered_df), "Tweet")

        with col2:
            ui.metric_card("Jumlah User", filtered_df["author_id"].nunique(), "User X/Twitter")

        with col3:
            if "created_at" in filtered_df.columns:
                periode = f"{filtered_df['created_at'].max().date()}"
            else:
                periode = "-"
            ui.metric_card("Update Terakhir", periode, "‎")

        with col4:
            if not filtered_df.empty:
                if "created_at" in filtered_df.columns:
                    avg_tweet_per_day = round(len(filtered_df) / filtered_df["created_at"].dt.date.nunique(), 2)
                else:
                    avg_tweet_per_day = "-"
                ui.metric_card("Rata-rata Tweet/Hari", avg_tweet_per_day, "Per hari")
            else:
                ui.metric_card("Rata-rata Tweet/Hari", "0")
    
        # ===== 1. STOPWORDS SETUP =====
        stop_factory = StopWordRemoverFactory()
        stopwords = set(stop_factory.get_stop_words())

        custom_stopwords = {
            "ikn", "nusantara", "ibu", "kota", "negara", "pemerintah",
            "bangun", "pembangunan", "presiden", "proyek", "akan", "sudah",
            "untuk", "yang", "pada", "dengan", "itu", "dari", "dan", "karena",
            "agar", "sebagai", "dalam", "oleh", "di", "ke", "ada", "buat",
            "yg", "gak", "udara", "bandar", "dpr", "berlokasi", "lokasi", 
            "internasional", "air", "prabowo", "bumn", "dibangun", "bandara",
            "hutama", "karya", "amp", "ga", "aja", "memuji", "pake", "mbg",
            "dr", "ikon kemajuan", "pastikan"
        }
        stopwords |= custom_stopwords


        # ===== 2. EKSTRAKSI ISU POPULER PER SENTIMEN =====
        def extract_top_issues_with_sentiment(df, text_col="clean_text", category_col="Kategori", top_n=3):
            if df.empty:
                return []

            vect = CountVectorizer(ngram_range=(1, 2), stop_words=list(stopwords))
            X = vect.fit_transform(df[text_col].dropna().astype(str))
            terms = vect.get_feature_names_out()
            term_freq = dict(zip(terms, X.sum(axis=0).A1))

            # Hubungkan kata/frasa dengan sentimen dominan
            sentiment_map = defaultdict(lambda: Counter())

            for _, row in df.iterrows():
                text = str(row[text_col]).lower()
                kategori = row[category_col]
                words = re.findall(r'\b[a-zA-Zà-ÿ]+\b', text)
                filtered = [w for w in words if w not in stopwords and len(w) > 3]
                for w in filtered:
                    sentiment_map[w][kategori] += 1

            # Ambil top N kata/frasa
            top_terms = sorted(term_freq.items(), key=lambda x: x[1], reverse=True)[:top_n]

            # Tentukan sentimen dominan per kata/frasa
            issue_list = []
            for term, count in top_terms:
                sent_counts = sentiment_map[term]
                if sent_counts:
                    dominant_sentiment = max(sent_counts, key=sent_counts.get)
                else:
                    dominant_sentiment = "Netral"
                issue_list.append((term, count, dominant_sentiment))

            return issue_list


        # ===== TAMPILAN DASHBOARD =====
        st.subheader("Kata Kunci Terpopuler Minggu Ini")

        top_issues = extract_top_issues_with_sentiment(filtered_df, text_col="clean_text", category_col="Kategori", top_n=3)

        if not top_issues:
            st.info("Belum ada kata kunci yang dominan dalam periode ini.")
        else:
            # Warna & emoji
            color_map = {
                "Positif": "#2ecc71",  # hijau
                "Negatif": "#e74c3c",  # merah
                "Netral": "#3498db",   # biru
            }
            emoji_map = {
                "Positif": "🌿",
                "Negatif": "🔥",
                "Netral": "⚖️",
            }

            # CSS interaktif
            st.markdown("""
                <style>
                .issue-card {
                    background-color: #f8f9fa;
                    padding: 22px;
                    border-radius: 18px;
                    text-align: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    transition: all 0.3s ease-in-out;
                }
                .issue-card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                    background-color: #ffffff;
                }
                .issue-title {
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                .issue-count {
                    font-size: 18px;
                    font-weight: 600;
                    margin-top: 5px;
                }
                .issue-sentiment {
                    font-size: 16px;
                    font-weight: 500;
                    opacity: 0.8;
                }
                </style>
            """, unsafe_allow_html=True)

            # Render 3 kolom interaktif
            col1, col2, col3 = st.columns(3)
            cols = [col1, col2, col3]

            for i, (kw, count, sentiment) in enumerate(top_issues):
                color = color_map.get(sentiment, "#95a5a6")
                emoji = emoji_map.get(sentiment, "💬")

                with cols[i]:
                    st.markdown(
                        f"""
                        <div class="issue-card">
                            <div class="issue-title" style="color:{color};">
                                {emoji} {kw.capitalize()}
                            </div>
                            <div class="issue-count">{count} kemunculan</div>
                            <div class="issue-sentiment" style="color:{color};">
                                ({sentiment})
                            </div>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )
                    st.divider()
                    # Tombol interaktif untuk menampilkan tweet terkait
                    with st.expander(f"Lihat Tweet terkait '{kw}'"):
                        related_tweets = filtered_df[
                            filtered_df["text"].str.contains(kw, case=False, na=False)
                        ][["text", "Kategori"]].head(10)

                        if related_tweets.empty:
                            st.write("Tidak ditemukan tweet yang mengandung kata kunci ini.")
                        else:
                            for _, row in related_tweets.iterrows():
                                sentiment_color = color_map.get(row["Kategori"], "#555")
                                st.markdown(
                                    f"""
                                    <div style="background-color:#f9f9f9; border-left:5px solid {sentiment_color};
                                    padding:10px; margin-bottom:8px; border-radius:8px;">
                                        <p style="margin:0; font-size:14px;">{row['text']}</p>
                                        <p style="color:{sentiment_color}; font-size:12px; margin-top:4px;">
                                        Sentimen: {row['Kategori']}</p>
                                    </div>
                                    """,
                                    unsafe_allow_html=True
                                )

        # === Distribusi Kategori (Pie Chart) ===
        kategori_counts = filtered_df["Kategori"].value_counts().reset_index()
        kategori_counts.columns = ["Kategori", "Jumlah"]
            
        st.subheader("Visualisasi Persepsi Masyarakat")
        col1, col2, col3 = st.columns(3)

        with col1:
            fig_pie = px.pie(
                kategori_counts,
                names="Kategori",
                values="Jumlah",
                title="Distribusi Sentimen",
                hole=0.4,
                color="Kategori",
                color_discrete_map={
                    "Positif": "green",
                    "Negatif": "red",
                    "Netral": "blue",
                }
            )
            if not filtered_df.empty:    
                st.plotly_chart(fig_pie, use_container_width=True)
            else:
                st.info("Tidak ada data untuk ditampilkan.")
        
        # Bar Chart
        with col2:
            fig_bar = px.bar(
                kategori_counts,
                x="Kategori",
                y="Jumlah",
                color="Kategori",
                text="Jumlah",
                title="Jumlah Tweet per Kategori",
                color_discrete_map={
                    "Positif": "green",
                    "Negatif": "red",
                    "Netral": "blue",
                }
            )
            if not filtered_df.empty:
                fig_bar.update_traces(textposition="outside")
                st.plotly_chart(fig_bar, use_container_width=True)
            else:
                st.info("Tidak ada data untuk ditampilkan.")

            # Line Chart (Tren Mingguan)
            with col3:
                trend = (
                    filtered_df.groupby([filtered_df["created_at"].dt.to_period("W").apply(lambda r: r.start_time), "Kategori"])
                    .size().reset_index(name="Jumlah")
                )

                if not filtered_df.empty:
                    fig_line = px.line(
                        trend,
                        x="created_at",
                        y="Jumlah",
                        color="Kategori",
                        markers=True,
                        title="Tren Harian",
                        color_discrete_map={
                            "Positif": "green",
                            "Negatif": "red",
                            "Netral": "blue",
                        }
                    )
                    fig_line.update_layout(xaxis_title="Tanggal", yaxis_title="Jumlah")
                    st.plotly_chart(fig_line, use_container_width=True)
                else:
                    st.info("Tidak ada data untuk ditampilkan.")
        
            
        col5, col6, col7 = st.columns(3)

        sentimencount = filtered_df["Kategori"].value_counts()
        with col5:
            ui.metric_card("Tweet Positif", str(sentimencount.get("Positif", 0)), "Tweet")
        with col6:
            ui.metric_card("Tweet Negatif", str(sentimencount.get("Negatif", 0))," Tweet")
        with col7:
            ui.metric_card("Tweet Netral", str(sentimencount.get("Netral", 0)), "Tweet")

        # Wordcloud
        st.divider()
        st.subheader("Kata Kunci Populer (Word Cloud)")
        if not filtered_df.empty:
            text_all = " ".join(filtered_df["clean_text"].astype(str))
            wordcloud = WordCloud(width=800, height=200, background_color="white").generate(text_all)
            fig_wc, ax_wc = plt.subplots(figsize=(10,5))
            ax_wc.imshow(wordcloud, interpolation="bilinear")
            ax_wc.axis("off")
            st.pyplot(fig_wc)
        else:
            st.info("Tidak ada data untuk ditampilkan.")
    with tab2:
        st.title("📂 Data")
        #st.write("Tabel data hasil scraping dan klasifikasi akan muncul di sini...")    
        st.subheader("Detail Data Tweet")
        st.dataframe(df[["clean_text", "Kategori"]], use_container_width=True)


    with tab3:
        st.title("🤖 Tentang Model Analisis")

        st.markdown("""
        Dashboard ini menggunakan **model analisis sentimen bahasa Indonesia** berbasis *transformer architecture* 
        yang dikembangkan oleh **Wilson Wongso (2023)**. Model ini dilatih menggunakan dataset publik terkait **komentar** dan **ulasan** di media sosial untuk mendeteksi polaritas sentimen postingan masyarakat dalam tiga kategori utama:
        - 🟢 **Positif** — teks dengan sentimen positif
        - 🔴 **Negatif** — teks dengan sentimen negatif
        - ⚪ **Neutral** — teks dengan makna netral atau deskriptif
        ---
        """)

        # 📄 Detail Teknis
        st.subheader("📘 Detail Teknis Model")
        st.markdown("""
        - **Nama Model:** `w11wo/indonesian-roberta-base-sentiment-classifier`  
        - **Arsitektur:** RoBERTa-base (Bahasa Indonesia)  
        - **Jenis Model:** Text Classification  
        - **Bahasa:** Bahasa Indonesia 🇮🇩  
        - **Jumlah Label:** 3 (Positif, Neutral, Negatif)  
        - **Framework:** 🤗 Hugging Face Transformers  
        - **Lisensi:** MIT License  
        """)

        # 🧩 Citation
        st.subheader("📚 Sitasi Model")
        st.code("""
@misc{wilson_wongso_2023,
    author    = {Wilson Wongso},
    title     = {indonesian-roberta-base-sentiment-classifier (Rev. 3)},
    year      = {2023},
    url       = {https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier},
    doi       = {10.57967/hf/0644},
    publisher = {Hugging Face}
}
    """, language="bibtex")

        # 🌐 Link langsung
        st.markdown("""
        **Sumber Model:**  
        👉 [https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier](https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier)  
        DOI: [10.57967/hf/0644](https://doi.org/10.57967/hf/0644)
        """)

elif page == "Search":
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
    
    st.subheader("🔍 Pencarian Kata Kunci (Keyword Search)")

    # Input pencarian
    keyword = st.text_input("Masukkan kata kunci untuk mencari tweet:")
    if keyword:
        # Filter dataframe berdasarkan kata kunci
        hasil_cari = filtered_df[filtered_df["text"].str.contains(keyword, case=False, na=False)]

        if not hasil_cari.empty:
            st.success(f"Ditemukan {len(hasil_cari)} tweet yang mengandung kata '{keyword}'")
            col8, col9, col10, col11, col12, col13, col14, col15, col16, col17, col18, col19, col20= st.columns(13, gap=None)
            with col8:
                # === Download CSV ===
                csv = hasil_cari.to_csv(index=False).encode("utf-8")
                st.download_button(
                    label="💾 .csv",
                    data=csv,
                    file_name=f"hasil_pencarian_{keyword}.csv",
                    mime="text/csv",
                )
            with col9:
            # === Download Excel ===
                output = BytesIO()
                with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
                    if "created_at" in hasil_cari.columns:
                        hasil_cari["created_at"] = pd.to_datetime(hasil_cari["created_at"]).dt.tz_localize(None)
                    hasil_cari.to_excel(writer, index=False, sheet_name="Hasil Pencarian")

                    # Ambil workbook dan worksheet
                    workbook = writer.book
                    worksheet = writer.sheets["Hasil Pencarian"]

                    # Format header
                    header_format = workbook.add_format(
                        {"bold": True, "text_wrap": True, "valign": "top", "fg_color": "#D7E4BC", "border": 1}
                    )

                    for col_num, value in enumerate(hasil_cari.columns.values):
                        worksheet.write(0, col_num, value, header_format)
                        worksheet.set_column(col_num, col_num, 25)  # auto lebar kolom

                excel_data = output.getvalue()

                st.download_button(
                    label="💾 .xlsx",
                    data=excel_data,
                    file_name=f"hasil_pencarian_{keyword}.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )           
            # Tampilkan hasil dengan highlight
            for _, row in hasil_cari.iterrows():
                # Highlight keyword dengan warna kuning
                highlighted_text = re.sub(
                    f"({keyword})",
                    r"<mark style='background-color: #fff176; color: black;'>\1</mark>",
                    row["text"],
                    flags=re.IGNORECASE
                )
                author = row["author_id"]
                tweet = row["clean_text"]
                author_link = f"https://twitter.com/i/user/{author}"
                st.markdown(
                    f"""
                    <div style="padding:10px; margin-bottom:10px; border-radius:8px; background-color:#f9f9f9;">
                        <p style="margin:0; font-size:14px;">
                            👤 <a href="{author_link}" target="_blank" style="text-decoration:none; color:#1DA1F2; font-weight:bold;">
                                ID: {author}
                            </a>
                        <p style="margin:0; font-size:15px;">{highlighted_text}</p>
                        <p style="margin:0; font-size:13px; color:gray;">
                            Kategori: <b>{row['Kategori']}</b> | Tanggal: {row['created_at'].strftime("%Y-%m-%d")}
                        </p>
                    </div>
                    """,
                    unsafe_allow_html=True
                )
        else:
            st.warning(f"Tidak ditemukan tweet yang mengandung kata '{keyword}'.")

    st.divider()

    def generate_pdf_formal(df):
        # ===== Persiapan PDF =====
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        doc = SimpleDocTemplate(
            tmp_file.name, 
            pagesize=A4, 
            topMargin=2*cm, 
            bottomMargin=2*cm,
            leftMargin=2*cm,
            rightMargin=2*cm
        )

        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name="Justify", alignment=4, leading=14))

        title_style = ParagraphStyle(
            "Title",
            fontSize=16,
            alignment=TA_CENTER,
            spaceAfter=20,
        )

        subtitle_style = ParagraphStyle(
            "Subtitle",
            fontSize=10,
            alignment=TA_CENTER,
            spaceAfter=12,
        )

        # ===== Data Ringkasan =====
        total_tweet = len(df)
        total_user = df["author_id"].nunique()
        last_update = df["created_at"].max().strftime("%Y-%m-%d")
        avg_per_day = round(total_tweet / df["created_at"].dt.date.nunique(), 2)

        kategori_counts = df["Kategori"].value_counts()

        # ===== Buat Pie Chart =====
        fig, ax = plt.subplots(figsize=(3,3))
        kategori_counts.plot.pie(
            autopct="%.1f%%", ax=ax, ylabel="",
            colors=["green", "red", "blue"]
        )
        ax.set_title("Distribusi Sentimen Masyarakat", fontsize=10)
        img_buf = BytesIO()
        plt.savefig(img_buf, format="png", bbox_inches="tight")
        plt.close(fig)
        img_buf.seek(0)

        elements = []

        # ===== Header dengan Logo =====
        elements.append(Image("logoiknnotext.png", width=100, height=120))
        elements.append(Paragraph("<b>Dashboard Analisis Persepsi Masyarakat di Sosial Media</b>", styles["Title"]))
        elements.append(Paragraph("Otorita Ibu Kota Nusantara · Transformasi Hijau dan Digital · Direktorat Data dan Kecerdasan Buatan", subtitle_style))
        elements.append(Spacer(1, 12))

        # ===== Chart Sentimen =====
        elements.append(Image(img_buf, width=200, height=200))
        elements.append(Spacer(1, 12))

        # ===== Ringkasan Metrik =====
        elements.append(Paragraph("<b>Ringkasan Analisis</b>", styles["Heading2"]))
        data_summary = [
            ["Total Tweet", total_tweet],
            ["Jumlah User", total_user],
            ["Update Terakhir", last_update],
            ["Rata-rata Tweet/Hari", avg_per_day],
        ]
        table = Table(data_summary, hAlign="LEFT", colWidths=[6*cm, 5*cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D7E4BC")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 12))

        # ===== Analisis Naratif =====
        elements.append(Paragraph("<b>Analisis Naratif</b>", styles["Heading2"]))
        elements.append(Paragraph(
            f"Dari total {total_tweet} tweet yang dianalisis, distribusi sentimen masyarakat "
            f"terhadap pembangunan IKN didominasi oleh kategori <b>{kategori_counts.idxmax()}</b>. "
            f"Hal ini menunjukkan kecenderungan opini publik yang penting untuk menjadi dasar dalam "
            f"strategi komunikasi publik OIKN agar dapat mengelola narasi positif, merespons kritik, "
            f"serta menindaklanjuti masukan konstruktif.",
            styles["Justify"]
        ))
        elements.append(Spacer(1, 12))

        # ===== Disclaimer =====
        elements.append(Paragraph("<b>Disclaimer</b>", styles["Heading2"]))
        elements.append(Paragraph(
            "Laporan ini dibuat sebagai bagian dari Aktualisasi Latsar CPNS. "
            "Dokumen ini hanya digunakan untuk tujuan pembelajaran dan simulasi analisis data publik.",
            styles["Normal"]
        ))

        # ===== Footer (Nomor Halaman & Identitas) =====
        def add_footer(canvas, doc):
            canvas.saveState()
            footer_text = "Otorita Ibu Kota Nusantara · Direktorat Data dan Kecerdasan Buatan"
            page_num = f"Halaman {doc.page}"
            canvas.setFont("Helvetica", 8)
            canvas.drawString(2*cm, 1*cm, footer_text)
            canvas.drawRightString(A4[0]-2*cm, 1*cm, page_num)
            canvas.restoreState()

        doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)

        return tmp_file.name


    # ===== STREAMLIT INTEGRASI =====
    st.subheader("📑 Download Laporan")
    if st.button("Generate laporan", icon="⬇️"):
        pdf_path = generate_pdf_formal(filtered_df)
        with open(pdf_path, "rb") as f:
            st.download_button(
                label=".pdf",
                data=f.read(),
                file_name="laporan_formal_ikn.pdf",
                mime="application/pdf",
                icon="📥"
            )


st.text("‎")
st.markdown("""
    <hr style="margin-top:50px; margin-bottom:10px;">
    <p style="text-align:center; font-size:13px; color:gray;">
        © 2025 Sean Daffa Damara – Direktorat Data dan Kecerdasan Buatan.<br>
        Dashboard ini dikembangkan sebagai bagian dari <b>Aktualisasi Latsar CPNS</b>.
    </p>
""", unsafe_allow_html=True)

