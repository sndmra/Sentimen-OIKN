import re
import nltk
from nltk.corpus import stopwords

# Daftar stopwords bahasa Indonesia
stop_words = set(stopwords.words("indonesian"))

def clean_text(text):
    text = str(text)

    # 1. Hapus link (http, https, t.co, www)
    text = re.sub(r"http\S+|www\S+|t\.co\S+", "", text)

    # 2. Hapus hashtag
    text = re.sub(r"#\S+", "", text)

    # 3. Hapus mention (@username)
    text = re.sub(r"@\S+", "", text)

    # 4. Hapus emoji & simbol non-alfabet
    text = re.sub(r"[^\w\s,.!?]", " ", text)

    # 5. Hapus spasi berlebih
    text = re.sub(r"\s+", " ", text).strip()

    # 6. Lowercase semua huruf
    text = text.lower()

    # 7. Hapus stopwords
    tokens = [word for word in text.split() if word not in stop_words]

    return " ".join(tokens)

import pandas as pd

# 1. Baca hasil merge
df = pd.read_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_merged.csv")

# 2. Hapus duplikat
df = df.drop_duplicates(subset=["id"], keep="first")

# 3. Bersihkan teks
df["clean_text"] = df["text"].astype(str).apply(clean_text)

# 4. Simpan kembali
df.to_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_clean.csv", index=False, encoding="utf-8-sig")

print(f"Selesai! Total data bersih: {len(df)}")
