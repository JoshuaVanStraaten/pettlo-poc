"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AvatarBadge } from "@/components/ui/avatar-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Appointment = {
  id: string
  scheduled_at: string
  status: string
  pet_id: string
  pets: { name: string; users: { full_name: string } | null } | null
  users: { full_name: string } | null
}

const STATUS_VARIANT: Record<string, "primary" | "warning" | "secondary" | "destructive" | "success"> = {
  confirmed: "primary",
  pending:   "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show:   "destructive",
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toDateInputValue(isoString: string) {
  return isoString.split("T")[0]
}

export function AppointmentsTable({ appointments: initial }: { appointments: Appointment[] }) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initial)
  const [dateFilter, setDateFilter] = useState("")

  const filtered = dateFilter
    ? appointments.filter(a => toDateInputValue(a.scheduled_at) === dateFilter)
    : appointments

  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      toast.error("Failed to update appointment")
      return
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    toast.success(status === "confirmed" ? "Appointment confirmed" : "Appointment cancelled")
  }

  return (
    <div>
      {/* Date filter */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Filter by date</label>
        <Input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ width: 180 }}
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
          >
            Clear
          </button>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            {["Time", "Date", "Pet Name", "Owner", "Veterinarian", "Status", "Actions"].map(h => (
              <th key={h} style={{
                textAlign: "left", padding: "9px 20px", fontWeight: 500,
                color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                No appointments found
              </td>
            </tr>
          ) : filtered.map(a => {
            const petName = a.pets?.name ?? "—"
            const ownerName = a.pets?.users?.full_name ?? "—"
            const vetName = a.users?.full_name ?? "—"
            const canConfirm = a.status === "pending"
            const canCancel = a.status !== "cancelled" && a.status !== "completed" && a.status !== "no_show"

            return (
              <tr key={a.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "13px 20px", fontWeight: 600, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(a.scheduled_at)}
                </td>
                <td style={{ padding: "13px 20px", color: "#475569" }}>
                  {formatDate(a.scheduled_at)}
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <AvatarBadge name={petName} size={28} />
                    <span style={{ fontWeight: 500 }}>{petName}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 20px", color: "#475569" }}>{ownerName}</td>
                <td style={{ padding: "13px 20px", color: "#475569" }}>{vetName}</td>
                <td style={{ padding: "13px 20px" }}>
                  <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </Badge>
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 6, cursor: "pointer",
                      }}>
                        <i className="bi bi-three-dots-vertical" style={{ fontSize: 14, color: "#94a3b8" }} />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/pets/${a.pet_id}`)}>
                        <i className="bi bi-eye" style={{ marginRight: 8 }} /> View Details
                      </DropdownMenuItem>
                      {canConfirm && (
                        <DropdownMenuItem onClick={() => updateStatus(a.id, "confirmed")}>
                          <i className="bi bi-check-lg" style={{ marginRight: 8 }} /> Confirm
                        </DropdownMenuItem>
                      )}
                      {canCancel && (
                        <DropdownMenuItem
                          onClick={() => updateStatus(a.id, "cancelled")}
                          style={{ color: "#dc2626" }}
                        >
                          <i className="bi bi-x-lg" style={{ marginRight: 8 }} /> Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
