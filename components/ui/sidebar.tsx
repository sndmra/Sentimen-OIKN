"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Database,
  Brain,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // ✅ Gunakan basePath dinamis agar kompatibel di GitHub Pages
  const basePath = process.env.NODE_ENV === "production" ? "/Sentimen-OIKN" : ""

  const menus = [
    { name: "Dashboard", href: `/dashboard`, icon: LayoutDashboard },
    { name: "Data", href: `/data`, icon: Database },
    { name: "Model", href: `/model`, icon: Brain },
    { name: "Tentang", href: `/tentang`, icon: Info },
  ]

  return (
    <aside
      className={cn(
        "border-r bg-[#f5f5f7] flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header (Logo + Toggle) */}
      <div className="flex items-center justify-between h-[61px] px-4 border-b border-[#e5e5e7] bg-[#f5f5f7]">
        {/* Logo (muncul hanya saat expand) */}
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Image
              src={`${basePath}/img/logo.png`} // ✅ gunakan basePath di sini juga
              alt="IKN Logo"
              width={32}
              height={32}
              priority
            />
            <h1 className="text-[1.1rem] font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>
        ) : (
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tombol collapse (saat expand) */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu Navigasi */}
      <nav
        className={cn(
          "flex-1 px-3 py-4 space-y-1 transition-all duration-300",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {menus.map((menu) => {
          const Icon = menu.icon
          // Sesuaikan path aktif agar cocok di GH Pages
          const active = pathname === menu.href || pathname === menu.href.replace(basePath, "")
          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{menu.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-6 py-4 border-t text-xs text-gray-400">
          © 2025 Sean Daffa Damara
        </div>
      )}
    </aside>
  )
}
