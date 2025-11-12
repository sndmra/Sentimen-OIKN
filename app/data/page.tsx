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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function DataPage() {
  const [tweets, setTweets] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Semua")
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    // ✅ Gunakan basePath agar kompatibel antara localhost dan GitHub Pages
    const basePath = process.env.NODE_ENV === "production" ? "/Sentimen-OIKN" : ""

    Papa.parse(`${basePath}/data/tweets_ikn_labeled.csv`, {
      download: true,
      header: true,
      delimiter: ",",
      complete: (result) => {
        const data = result.data.filter(
          (d: any) => d.Kategori && d.clean_text && d.created_at
        )
        data.forEach((d: any) => (d.date = new Date(d.created_at)))
        data.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        setTweets(data)
      },
    })
  }, [])

  // ================= FILTER & SEARCH =================
  const filtered = tweets.filter((t) => {
    const matchFilter =
      filter === "Semua" ||
      t.Kategori?.toLowerCase().includes(filter.toLowerCase())
    const matchSearch = t.clean_text
      ?.toLowerCase()
      .includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handlePage = (num: number) => {
    if (num >= 1 && num <= totalPages) setPage(num)
  }

  // ✅ Gunakan basePath juga untuk tombol download CSV
  const basePath = process.env.NODE_ENV === "production" ? "/Sentimen-OIKN" : ""

  // ================= RENDER =================
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Analisis Sentimen</CardTitle>
          <CardDescription>
            Gunakan filter atau pencarian untuk menelusuri tweet berdasarkan
            kategori atau kata kunci.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ========== FILTER & SEARCH ========== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  <SelectItem value="Positif">Positif</SelectItem>
                  <SelectItem value="Netral">Netral</SelectItem>
                  <SelectItem value="Negatif">Negatif</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Cari teks tweet..."
                className="w-60"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* ✅ Link CSV mengikuti basePath */}
            <a
              href={`${basePath}/data/tweets_ikn_labeled.csv`}
              download="tweets_ikn_labeled.csv"
              className="inline-flex items-center justify-center text-sm border rounded-md px-4 py-2 hover:bg-muted transition"
            >
              Unduh CSV
            </a>
          </div>

          {/* ========== TABLE ========== */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Teks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.created_at}
                  </TableCell>
                  <TableCell>
                    {row.Kategori?.toLowerCase().includes("positif") && (
                      <Badge className="bg-green-500">Positif</Badge>
                    )}
                    {row.Kategori?.toLowerCase().includes("netral") && (
                      <Badge className="bg-yellow-500">Netral</Badge>
                    )}
                    {row.Kategori?.toLowerCase().includes("negatif") && (
                      <Badge className="bg-red-500">Negatif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xl truncate">
                    {row.clean_text}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* ========== PAGINATION ========== */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <p>
              Menampilkan {paginated.length} dari {filtered.length} data.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePage(page - 1)}
              >
                ‹
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) => num >= page - 1 && num <= page + 2)
                .map((num) => (
                  <Button
                    key={num}
                    variant={num === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePage(num)}
                  >
                    {num}
                  </Button>
                ))}

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => handlePage(page + 1)}
              >
                ›
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
