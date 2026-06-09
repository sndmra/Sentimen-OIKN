import streamlit as st

# =============================
# Konfigurasi pengguna
# =============================
USER_CREDENTIALS = {
    "tes": "tes",
    "tes": "tes",
}

# =============================
# Fungsi login
# =============================
def login_form():
    st.title("🔐 Login Dashboard Analisis Sentimen IKN")
    st.write("Silakan masuk menggunakan akun resmi OIKN untuk mengakses dashboard.")

    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    login_button = st.button("Masuk")

    if login_button:
        if username in USER_CREDENTIALS and USER_CREDENTIALS[username] == password:
            st.session_state["authenticated"] = True
            st.session_state["user"] = username
            st.success(f"Selamat datang, {username}!")
            st.rerun()
        else:
            st.error("❌ Username atau password salah.")