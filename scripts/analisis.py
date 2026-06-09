import pandas as pd
from sentiment import classify_long_text

# 1. Baca file hasil scraping
df = pd.read_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_clean.csv")

# 2. Jalankan analisis per tweet
labels = []
for text in df["text"]:
    result = classify_long_text(str(text))  # pastikan teks jadi string
    labels.append(result["label"])          # ambil label finalnya

# 3. Tambahkan kolom baru ke DataFrame
df["Kategori"] = labels

# 4. Simpan hasil ke CSV baru
df.to_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_labeled.csv", index=False, encoding="utf-8-sig")

print("Analisis selesai! Hasil disimpan ke tweets_ikn_labeled.csv")
