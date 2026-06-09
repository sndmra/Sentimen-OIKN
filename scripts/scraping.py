import tweepy
import pandas as pd

# ===== Ganti dengan token kamu =====
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAMJR4QEAAAAAL0%2FHwHfxGQ6WwedmqGcDZurTk1I%3DhNczuulrPNdc8vAcDboxlupRwxmqeASVETQWrnOTV3llCvJe7y"

# Setup client
client = tweepy.Client(bearer_token=BEARER_TOKEN, wait_on_rate_limit=True)

# Query (hanya Bahasa Indonesia, tanpa retweet)
query = "IKN lang:id -is:retweet"

# Ambil 100 tweet terbaru
tweets = client.search_recent_tweets(
    query=query,
    tweet_fields=["id", "created_at", "text", "lang", "author_id"],
    max_results=70
)

# Simpan ke DataFrame
data = []
if tweets.data:
    for tweet in tweets.data:
        data.append([
            tweet.id,
            tweet.created_at,
            tweet.author_id,
            tweet.text
        ])

df = pd.DataFrame(data, columns=["id", "created_at", "author_id", "text"])

# Simpan ke CSV
df.to_csv("tweets_ikn.csv", index=False, encoding="utf-8-sig")

print(f"Selesai! Tersimpan {len(df)} tweet di tweets_ikn.csv")

from merging import merge

merge()
