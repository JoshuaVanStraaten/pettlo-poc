import { createServiceClient } from "@/lib/supabase/service"
import { AppointmentsTable } from "@/components/appointments-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createServiceClient()

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, pets(name, owner_id, users!pets_owner_id_fkey(full_name)), users!appointments_vet_id_fkey(full_name)")
    .order("scheduled_at", { ascending: true })

  const appts = appointments ?? []

  const todayStr = new Date().toISOString().split("T")[0]
  const todayCount = appts.filter(a => a.scheduled_at.split("T")[0] === todayStr).length
  const pendingCount = appts.filter(a => a.status === "pending").length

  const STATS = [
    { label: "Today's Appointments", value: todayCount,  icon: "bi-calendar3",    color: "#1a7bbf", sub: "Filtered by date below" },
    { label: "Pets Registered",       value: 5,           icon: "bi-heart-pulse",  color: "#7c3aed", sub: "5 in clinic"            },
    { label: "Active Vets",           value: 2,           icon: "bi-person-badge", color: "#059669", sub: "All available"          },
    { label: "Pending Confirmations", value: pendingCount,icon: "bi-clock-history",color: "#d97706", sub: "Needs action"           },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Good morning!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "6px 0 0", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: s.color, margin: "6px 0 0", fontWeight: 500 }}>{s.sub}</p>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: s.color + "18", color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                }}>
                  <i className={`bi ${s.icon}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointments table */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Track and manage all clinic appointments</CardDescription>
            </div>
            <Link href="/appointments/new" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: "#0f172a", color: "white", textDecoration: "none",
            }}>
              <i className="bi bi-plus-lg" /> New Appointment
            </Link>
          </div>
        </CardHeader>
        <CardContent style={{ padding: "12px 0 0" }}>
          <AppointmentsTable appointments={appts as any} />
        </CardContent>
      </Card>
    </div>
  )
}
