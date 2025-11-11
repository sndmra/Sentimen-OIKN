"use client"

import { useEffect, useState } from "react"
import Papa from "papaparse"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import CountUp from "react-countup"

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, ChartDataLabels)

export default function Dashboard() {
  const [tweets, setTweets] = useState<any[]>([])
  const [summary, setSummary] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  })
  const [change, setChange] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  })
  const [periodLabel, setPeriodLabel] = useState("")
  const [gaugeValue, setGaugeValue] = useState(0)

  useEffect(() => {
    Papa.parse("/data/tweets_ikn_labeled.csv", {
      download: true,
      header: true,
      delimiter: ",",
      complete: (result) => {
        const data = result.data.filter(
          (d: any) => d.Kategori && d.clean_text && d.created_at
        )
        data.forEach((d: any) => (d.date = new Date(d.created_at)))
        data.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
        setTweets(data)

        const totalSummary = { positive: 0, neutral: 0, negative: 0 }
        data.forEach((row: any) => {
          const s = row.Kategori.toLowerCase()
          if (s.includes("positif")) totalSummary.positive++
          else if (s.includes("netral")) totalSummary.neutral++
          else if (s.includes("negatif")) totalSummary.negative++
        })
        setSummary(totalSummary)

        const maxDate = new Date(Math.max(...data.map((d: any) => d.date.getTime())))
        const periode1 = data.filter((d: any) => d.date < maxDate)
        const periode2 = data.filter((d: any) => d.date <= maxDate)

        const calc = (arr: any[]) => {
          const c = { positive: 0, neutral: 0, negative: 0 }
          arr.forEach((r: any) => {
            const s = r.Kategori.toLowerCase()
            if (s.includes("positif")) c.positive++
            else if (s.includes("netral")) c.neutral++
            else if (s.includes("negatif")) c.negative++
          })
          return c
        }

        const p1 = calc(periode1)
        const p2 = calc(periode2)
        const share1Total = p1.positive + p1.neutral + p1.negative || 1
        const share2Total = p2.positive + p2.neutral + p2.negative || 1
        const share1 = {
          positive: (p1.positive / share1Total) * 100,
          neutral: (p1.neutral / share1Total) * 100,
          negative: (p1.negative / share1Total) * 100,
        }
        const share2 = {
          positive: (p2.positive / share2Total) * 100,
          neutral: (p2.neutral / share2Total) * 100,
          negative: (p2.negative / share2Total) * 100,
        }
        const delta = {
          positive: share2.positive - share1.positive,
          neutral: share2.neutral - share1.neutral,
          negative: share2.negative - share1.negative,
        }
        setChange(delta)

        const fmt = (d: Date) =>
          d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        const minDate = new Date(Math.min(...data.map((d: any) => d.date.getTime())))
        setPeriodLabel(`${fmt(minDate)} ke ${fmt(maxDate)}`)
      },
    })
  }, [])

  const total = summary.positive + summary.neutral + summary.negative || 1

  // ================= Animasi Gauge =================
  useEffect(() => {
    const totalVal = summary.positive + summary.neutral + summary.negative || 1
    const percNegative = (summary.negative / totalVal) * 100
    let start = 0
    const duration = 1000
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const val = start + (percNegative - start) * progress
      setGaugeValue(val)
      if (progress < 1) requestAnimationFrame(animate)
    }
    if (percNegative > 0) requestAnimationFrame(animate)
  }, [summary])

  // ================= Charts =================
  const pieData = {
    labels: ["Positif", "Netral", "Negatif"],
    datasets: [
      {
        data: [
          (summary.positive / total) * 100,
          (summary.neutral / total) * 100,
          (summary.negative / total) * 100,
        ],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 1,
      },
    ],
  }

  const pieOptions = {
    plugins: {
      legend: { display: true, position: "bottom" as const },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" as const, size: 13 },
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
  }

  const trendMap = tweets.reduce((acc: any, row: any) => {
    let d = row.created_at
    if (d.includes("+")) d = d.split("+")[0]
    if (d.includes("T")) d = d.split("T")[0]
    else if (d.includes(" ")) d = d.split(" ")[0]
    if (!acc[d]) acc[d] = { date: d, positive: 0, neutral: 0, negative: 0 }
    const s = row.Kategori?.toLowerCase().trim() || ""
    if (s.includes("positif")) acc[d].positive++
    else if (s.includes("netral")) acc[d].neutral++
    else if (s.includes("negatif")) acc[d].negative++
    return acc
  }, {})

  const trend = Object.values(trendMap).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const TrendBadge = ({ value }: { value: number }) => (
    <div
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${
        value > 0
          ? "border-green-300 text-green-700 bg-green-50"
          : value < 0
          ? "border-red-300 text-red-700 bg-red-50"
          : "border-gray-200 text-gray-500 bg-gray-50"
      }`}
    >
      {value > 0 ? <ArrowUpRight size={12} /> : value < 0 ? <ArrowDownRight size={12} /> : null}
      {`${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ===== Metric Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Positive */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-0">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800 mb-3">
                Sentimen Positif
              </CardTitle>
              <div className="text-4xl font-bold text-green-600 leading-none">
                <CountUp end={summary.positive} duration={1.2} separator="," />
              </div>
            </div>
            <TrendBadge value={change.positive} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">{periodLabel}</p>
            <p className="text-sm text-gray-700">Opini mendukung pembangunan IKN</p>
          </CardContent>
        </Card>

        {/* Neutral */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-0">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800 mb-3">
                Sentimen Netral
              </CardTitle>
              <div className="text-4xl font-bold text-yellow-600 leading-none">
                <CountUp end={summary.neutral} duration={1.2} separator="," />
              </div>
            </div>
            <TrendBadge value={change.neutral} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">{periodLabel}</p>
            <p className="text-sm text-gray-700">Opini bersifat netral</p>
          </CardContent>
        </Card>

        {/* Negative */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-0">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800 mb-3">
                Sentimen Negatif
              </CardTitle>
              <div className="text-4xl font-bold text-red-600 leading-none">
                <CountUp end={summary.negative} duration={1.2} separator="," />
              </div>
            </div>
            <TrendBadge value={change.negative} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">{periodLabel}</p>
            <p className="text-sm text-gray-700">Opini bersifat kritik atau cacian</p>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-0">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800 mb-3">
                Total Opini
              </CardTitle>
              <div className="text-4xl font-bold leading-none">
                <CountUp end={total} duration={1.2} separator="," />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">X/Twitter</span>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">Baris data</p>
            <p className="text-sm text-gray-700">Data real dari media sosial</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== Insight + Gauge ===== */}
      {periodLabel && (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Insight Box */}
            <Card className="flex-1 border border-blue-300 bg-blue-50/50 rounded-xl">
              <CardHeader className="flex flex-row items-center space-x-2 pb-1">
                <div className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </div>
                <CardTitle className="text-lg text-gray-800">Insight</CardTitle>
              </CardHeader>

              <CardContent className="pt-0 pb-2 text-gray-700 text-sm leading-relaxed">
                {(() => {
                  const parts = periodLabel.split("ke")
                  const start = parts[0]?.trim() || "-"
                  const end = parts[1]?.trim() || "-"
                  return (
                    <>
                      <p className="mb-1">
                        Periode <strong>{start}</strong> – <strong>{end}</strong> menunjukkan bahwa
                        sentimen <strong className="text-green-600">positif</strong> naik{" "}
                        <strong>{change.positive.toFixed(1)}%</strong>, sedangkan{" "}
                        <strong className="text-yellow-600">netral</strong> dan{" "}
                        <strong className="text-red-600">negatif</strong> masing-masing turun{" "}
                        <strong>
                          {Math.abs(change.neutral).toFixed(1)}% / {Math.abs(change.negative).toFixed(1)}%
                        </strong>.
                      </p>
                      <p className="mt-1">
                        Opini masyarakat kini{" "}
                        {change.positive > change.negative
                          ? "semakin optimistis dan mendukung pembangunan IKN."
                          : "masih menunjukkan kecenderungan kritik terhadap pembangunan IKN."}
                      </p>
                      <p className="mt-2 text-xs text-gray-500 italic">
                        Data terakhir diperbarui: {end}
                      </p>
                    </>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Gauge */}
            <div className="flex justify-center md:justify-end w-full md:w-[290px]">
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center w-200 h-[210px]">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Sentimen Publik Saat Ini
                </p>
                <div className="relative w-[110px] h-[110px] mb-3">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${gaugeValue}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "40px",
                        color: "#ef4444",
                        lineHeight: "1",
                      }}
                    >
                      sentiment_dissatisfied
                    </span>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-500">
                  {gaugeValue.toFixed(2)}%
                </p>
                <p className="text-sm font-semibold text-gray-800">Negatif</p>
              </div>
            </div>
          </div>

          {/* ===== Kata Kunci ===== */}
          <div className="mt-3">
            {(() => {
              const stopwords = new Set([
                "yang","dan","di","ke","dari","untuk","dengan","itu","ini","pada",
                "dalam","ada","akan","karena","atau","sudah","bukan","jadi","agar",
                "lebih","kami","kita","mereka","bisa","akan","sebagai","tentang",
                "ikn","kota","nusantara","indonesia","negara","tidak","gak","amp",
                "otorita","bumn","2028","proyek","jalan","tdk","rakyat","jokowi",
                "prabowo","bangun","aja","dpr","bandar","internasional","berlokasi", 
                "kalimantan","kemajuan","mbg","presiden","cepat","kebanggaan", 
                "infrastruktur"
              ])

              const wordCount: Record<string, number> = {}
              tweets.forEach((t: any) => {
                const text = t.clean_text?.toLowerCase()
                  ?.replace(/[^a-z0-9#\s]/g, " ")
                  ?.split(/\s+/)
                  .filter((w: string) => w.length > 2 && !stopwords.has(w))
                text?.forEach((w: string) => {
                  wordCount[w] = (wordCount[w] || 0) + 1
                })
              })

              const keywords = Object.entries(wordCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([w]) => w)

              return (
                <>
                  <p className="text-xs text-gray-600 font-medium mb-2">
                    Kata kunci teratas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[13.5px] md:text-sm font-semibold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        </>
      )}

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Proporsi Sentimen</CardTitle>
            <CardDescription>
              Distribusi opini masyarakat di media sosial (Twitter)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Sentimen per Hari</CardTitle>
            <CardDescription>
              Perubahan opini masyarakat (dalam satuan waktu)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  label={{
                    value: "Jumlah Tweet",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="positive" name="Positif" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="neutral" name="Netral" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="negative" name="Negatif" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
