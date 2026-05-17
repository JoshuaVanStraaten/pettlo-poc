"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AvatarBadge } from "@/components/ui/avatar-badge"

const NAV_ITEMS = [
  { href: "/dashboard",        label: "Dashboard",    icon: "bi-speedometer2" },
  { href: "/pets",             label: "Pets",         icon: "bi-heart-pulse"  },
  { href: "/appointments/new", label: "Appointments", icon: "bi-calendar3"    },
  { href: "/settings",         label: "Settings",     icon: "bi-gear"         },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div style={{
      width: 240, minHeight: "100vh", background: "#0f172a",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "#1a7bbf",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <i className="bi bi-heart-pulse-fill" style={{ color: "white", fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Pettlo</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Clinic Management</div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "18px 16px 6px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Main Menu
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0 10px", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 7, fontSize: 14, fontWeight: 500,
              marginBottom: 2, textDecoration: "none", transition: "all 0.15s",
              background: active ? "#1a7bbf" : "transparent",
              color: active ? "white" : "#94a3b8",
            }}>
              <i className={`bi ${item.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: "12px 14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarBadge name="Emily Clarke" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Emily Clarke
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>Clinic Staff</div>
          </div>
          <i className="bi bi-three-dots-vertical" style={{ color: "#475569", fontSize: 14 }} />
        </div>
      </div>
    </div>
  )
}
