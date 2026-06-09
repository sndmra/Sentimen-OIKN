from transformers import pipeline
import re

# Load model pre-trained sentiment
pretrained_name = "w11wo/indonesian-roberta-base-sentiment-classifier"
nlp = pipeline("sentiment-analysis", model=pretrained_name, tokenizer=pretrained_name)

# split text
def split_text(text, max_len=250):
    sentences = re.split(r'(?<=[.!?]) +', text)
    return [s.strip() for s in sentences if s.strip()]

# keywords
positive_keywords = ["dukung ikn", "setuju ikn", "mendukung ikn", "pro ikn", "seindah", "bagus", "hebat", "setuju", "baik", "maju", "indah", "hijau"]
negative_keywords = ["tolak ikn", "anti ikn", "batalkan ikn", "stop ikn", "julid", "ga guna", "tidak berguna", "mahal", "lonte", "lc", "mangkal"]
netral_keywords = ["tapi", "namun", "sebaiknya", "perlu", "harus", "lihat", "lihatin", "fawzi"]

# priority
priority_scores = {
    "Positif": 1,
    "Negatif": 1,
    "Netral": 0
}

def classify_ikn(text):
    result = nlp(text)[0]
    sentiment = result['label']
    score = result['score']
    text_low = text.lower()

    # rules
    if any(kw in text_low for kw in negative_keywords):
        return {"label": "Negatif", "score": score}

    elif any(kw in text_low for kw in positive_keywords):
        return {"label": "Positif", "score": score}

    elif sentiment == "neutral" or score < 0.7:
        return {"label": "Netral", "score": score}

    elif sentiment == "negative":
        return {"label": "Negatif", "score": score}

    elif sentiment == "positive":
        return {"label": "Positif", "score": score}

    return {"label": "Netral", "score": score}

def classify_long_text(text):
    chunks = split_text(text)
    results = [classify_ikn(chunk) for chunk in chunks]

    # hitung jumlah kategori
    count = {k: 0 for k in priority_scores.keys()}
    for r in results:
        count[r['label']] += 1

    # safeguard: kalau hanya ada 1 kategori unik di detail → ambil langsung
    unique_labels = [k for k, v in count.items() if v > 0]
    if len(unique_labels) == 1:
        return {
            "label": unique_labels[0],
            "detail": results,
            "count_summary": count,
            "score_summary": {k: count[k] * priority_scores[k] for k in count}
        }

    # hitung skor total (jumlah × prioritas)
    score_count = {k: count[k] * priority_scores[k] for k in count}

    # cari label dengan skor tertinggi
    max_score = max(score_count.values())
    top_labels = [k for k, v in score_count.items() if v == max_score]

    # kalau hanya satu label unggul → pakai itu
    if len(top_labels) == 1:
        final_label = top_labels[0]
    else:
        # kalau ada seri → ambil label dengan rata-rata confidence tertinggi
        avg_scores = {}
        for lbl in top_labels:
            lbl_scores = [r["score"] for r in results if r["label"] == lbl]
            avg_scores[lbl] = sum(lbl_scores) / len(lbl_scores) if lbl_scores else 0
        final_label = max(avg_scores, key=avg_scores.get)

    return {
        "label": final_label,
        "detail": results,
        "count_summary": count,
        "score_summary": score_count
    }

# uji coba
samples = [
    "IKN ini bagus buat pemerataan pembangunan. Tapi sayang kalau nanti lingkungan tidak dijaga. Pemerintah perlu hati-hati.",
    "IKN harusnya dihentikan saja. Biayanya terlalu besar. Tidak ada manfaat jelas.",
    "IKN adalah proyek penting untuk masa depan bangsa. Saya sangat setuju dan bangga.",
    "IKN berlokasi di Kalimantan Timur.",
    "Mahal doang tapi ga guna. Kayak IKN"
]

for s in samples:
    print("\nTeks:", s)
    print(classify_long_text(s))