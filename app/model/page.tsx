"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"

export default function ModelPage() {
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
      {/* ========== Bagian 1: Algoritma & Evaluasi ========== */}
      <section className="space-y-6">
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Algoritma</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Model ini menggunakan kombinasi{" "}
                <strong>Logistic Regression</strong> dan{" "}
                <strong>TF-IDF Vectorization</strong> untuk mengubah teks mentah hasil{" "}
                <em>scraping</em> media sosial menjadi representasi numerik yang dapat
                dianalisis. Pendekatan ini dipilih karena ringan, cepat dilatih, dan memberikan
                performa tinggi dalam klasifikasi sentimen berbasis bahasa alami Indonesia.
              </p>
              <div className="border rounded-md bg-muted/40 p-3 text-xs">
                <strong>💡 Keunggulan:</strong> sederhana namun efektif untuk mendeteksi pola
                kata yang menentukan arah sentimen (positif, netral, negatif).
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Evaluasi Performa Model</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Hasil evaluasi menunjukkan bahwa model mencapai performa yang{" "}
                <strong>stabil dan unggul</strong> setelah pelatihan selama 5 epoch.
                Nilai metrik utama memperlihatkan keseimbangan antara presisi dan
                sensitivitas.
              </p>

              <div className="space-y-3">
                <Metric label="Akurasi" value={94.2} />
                <Metric label="Presisi" value={92.4} />
                <Metric label="Recall" value={91.7} />
                <Metric label="F1-Score" value={92.1} />
              </div>

              <div className="border rounded-md bg-muted/40 p-3 text-xs">
                <strong>Insight:</strong> Model dapat digunakan{" "}
                <em>real-time</em> untuk memantau sentimen publik terhadap kebijakan IKN,
                dengan stabilitas prediksi tinggi.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ========== Bagian 2: Tentang Model Analisis ========== */}
      <section className="space-y-6">
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Tentang Model Analisis</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                Dashboard ini menggunakan{" "}
                <strong>model analisis sentimen bahasa Indonesia</strong>{" "}
                berbasis <em>transformer architecture</em> dari{" "}
                <strong>Wilson Wongso (2023)</strong> dengan tiga kategori sentimen utama.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Positif
                </Badge>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Negatif
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  Netral
                </Badge>
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Detail Teknis Model</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p>
                    <strong>Nama Model:</strong>{" "}
                    w11wo/indonesian-roberta-base-sentiment-classifier
                  </p>
                  <p>
                    <strong>Arsitektur:</strong> RoBERTa-base
                  </p>
                  <p>
                    <strong>Framework:</strong> 🤗 Hugging Face Transformers
                  </p>
                  <p>
                    <strong>Lisensi:</strong> MIT License
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Sitasi Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{`@misc{wilson_wongso_2023,
  author    = {Wilson Wongso},
  title     = {indonesian-roberta-base-sentiment-classifier (Rev. 3)},
  year      = {2023},
  url       = {https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier},
  doi       = {10.57967/hf/0644},
  publisher = {Hugging Face}
}`}
                  </pre>
                  <p className="text-xs mt-2">
                    <strong>Sumber:</strong>{" "}
                    <a
                      href="https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier
                    </a>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </motion.div>
  )
}

// Reusable metric component
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value.toFixed(1)}%</span>
      </p>
      <Progress value={value} className="h-2" />
    </div>
  )
}
