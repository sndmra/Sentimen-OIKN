import "@/app/globals.css"
import { Sidebar } from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "Dashboard Analisis Sentimen (OIKN)",
  description: "Dashboard Analisis Persepsi Publik terhadap Pembangunan IKN",
  icons: {
    icon: "/img/logo.png",
    apple: "/img/logo.png",
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* 🌐 Preconnect untuk optimasi font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />

        {/* 🟡 Logo / Favicon */}
        <link rel="icon" type="image/png" href="/img/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/logo.png" />
        <meta name="theme-color" content="#ffffff" />

        {/* 🧠 Metadata tambahan */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Otorita Ibu Kota Nusantara (OIKN)" />
        <meta property="og:title" content="Dashboard Analisis Sentimen (OIKN)" />
        <meta
          property="og:description"
          content="Pantau persepsi publik terhadap pembangunan IKN dengan analisis sentimen berbasis AI."
        />
        <meta property="og:image" content="/img/logo.png" />
        <meta property="og:type" content="website" />
      </head>

      <body className="flex min-h-screen bg-background text-foreground antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main
            id="dashboard-container"
            className="flex-1 p-6 overflow-auto bg-white scroll-smooth"
          >
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
