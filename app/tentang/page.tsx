"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { motion } from "framer-motion"
import { Target, Gem, StickyNote } from "lucide-react"

export default function TentangPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      }}
    >
      {/* ================= Tujuan ================= */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle>Tujuan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Memantau persepsi dan sentimen masyarakat terhadap pembangunan Ibu Kota
                Nusantara melalui data media sosial.
              </li>
              <li>
                Mendukung transparansi publik dan komunikasi strategis pemerintah berbasis
                data digital.
              </li>
              <li>
                Menyediakan data terstruktur untuk pengambilan keputusan berbasis bukti{" "}
                <em>(evidence-based policy)</em>.
              </li>
              <li>
                Menumbuhkan budaya kerja adaptif dan inovatif di lingkungan ASN menuju
                pemerintahan berbasis data.
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================= Nilai Dasar ASN ================= */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-primary" />
              <CardTitle>Nilai Dasar ASN – BerAKHLAK</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Dalam pelaksanaan aktualisasi ini, penulis mengimplementasikan nilai-nilai
              dasar ASN <strong>BerAKHLAK</strong> sebagai panduan perilaku dan etika kerja:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Berorientasi Pelayanan</strong> – mempermudah akses dan pemantauan
                data sentimen publik melalui dashboard digital.
              </li>
              <li>
                <strong>Akuntabel</strong> – setiap visualisasi dan analisis data dapat
                ditelusuri dan dipertanggungjawabkan secara terbuka.
              </li>
              <li>
                <strong>Kompeten</strong> – menerapkan pengetahuan{" "}
                <em>data science</em> dan <em>machine learning</em> dalam analisis
                sentimen.
              </li>
              <li>
                <strong>Harmonis</strong> – berkolaborasi dengan berbagai pihak untuk
                memastikan integrasi data dan komunikasi publik efektif.
              </li>
              <li>
                <strong>Loyal</strong> – mendukung visi besar pembangunan IKN sebagai simbol
                peradaban bangsa.
              </li>
              <li>
                <strong>Adaptif</strong> – memanfaatkan teknologi digital terkini dalam
                pengelolaan data dan pelaporan.
              </li>
              <li>
                <strong>Kolaboratif</strong> – mendorong kerja sama lintas unit dan
                pemanfaatan data bersama antar-direktorat di OIKN.
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================= Catatan ================= */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" />
              <CardTitle>Catatan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Dashboard ini dikembangkan sebagai bukti nyata penerapan nilai ASN{" "}
              <strong>BerAKHLAK</strong> dalam kegiatan{" "}
              <strong>Aktualisasi Latsar CPNS Tahun 2025</strong>, sekaligus mendukung
              implementasi <strong>Transformasi Digital dan Smart Governance</strong> di
              lingkungan <strong>Otorita Ibu Kota Nusantara</strong>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
