"use client"

import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import * as htmlToImage from "html-to-image"

export function Header() {
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      const dashboard = document.getElementById("dashboard-container")
      if (!dashboard) throw new Error("Elemen dashboard tidak ditemukan.")

      // convert dashboard menjadi image PNG resolusi tinggi
      const dataUrl = await htmlToImage.toPng(dashboard, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        skipFonts: true
      })

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = "dashboard_sentimen_ikn.png"
      link.click()

      toast({
        title: "Berhasil disimpan!",
        description: "Gambar dashboard berhasil diekspor.",
        variant: "success",
        duration: 1
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "❌ Gagal melakukan export",
        description:
          "Beberapa elemen tidak bisa di-render. Coba lagi setelah halaman selesai dimuat.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-3 bg-white static top-0 z-20">
      <h2 className="text-sm text-muted-foreground">
        Selamat Datang di Dashboard Analisis Persepsi Masyarakat Terhadap Pembangunan IKN
      </h2>
      <Button
        onClick={handleExport}
        variant="default"
        className="bg-black text-white flex items-center gap-2 hover:bg-gray-800 transition"
      >
        <Camera className="w-4 h-4" />
        Quick Export
      </Button>
    </header>
  )
}
