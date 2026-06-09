import pandas as pd

# Function
def merge():   
    df1 = pd.read_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn.csv")
    df2 = pd.read_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_merged.csv")
    df_combined = pd.concat([df1, df2], ignore_index=True)
    df_combined.to_csv("/Users/seandamara/Documents/Latsar CPNS/Model/Streamlit/tweets_ikn_merged.csv", index=False)
    print("Jumlah baris:", len(df_combined))
    return

merge()