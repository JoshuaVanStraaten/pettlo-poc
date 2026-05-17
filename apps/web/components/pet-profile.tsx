"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AvatarBadge } from "@/components/ui/avatar-badge"

type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
  date_of_birth: string | null
  microchip: string | null
  users: { full_name: string; email: string } | null
}

type Visit = {
  id: string
  visited_at: string
  chief_complaint: string | null
  diagnosis: string | null
  treatment: string | null
  users: { full_name: string } | null
}

type Vaccination = {
  id: string
  vaccine_name: string
  administered_at: string
  next_due_at: string | null
  users: { full_name: string } | null
}

const SPECIES_ACCENT: Record<string, string> = {
  Dog: "#1a7bbf", Cat: "#7c3aed", Rabbit: "#059669",
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function PetProfile({
  pet,
  visits,
  vaccinations,
}: {
  pet: Pet
  visits: Visit[]
  vaccinations: Vaccination[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<"overview" | "visits" | "vaccinations">("overview")
  const accent = SPECIES_ACCENT[pet.species] ?? "#1a7bbf"
  const speciesBadgeVariant = pet.species === "Dog" ? "primary" : pet.species === "Cat" ? "outline" : "success"

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960 }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
          fontSize: 13, color: "#64748b", background: "none", border: "none",
          cursor: "pointer", padding: "4px 0", fontWeight: 500,
        }}
      >
        <i className="bi bi-arrow-left" style={{ fontSize: 13 }} /> Back to Pets
      </button>

      {/* Profile header */}
      <Card style={{ marginBottom: 24 }}>
        <CardContent style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{
              width: 88, height: 88, borderRadius: 16, flexShrink: 0,
              background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${accent}28`,
            }}>
              <AvatarBadge name={pet.name} size={72} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>{pet.name}</h2>
                <Badge variant={speciesBadgeVariant}>{pet.species}</Badge>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>{pet.breed ?? "Unknown breed"}</p>
              <div style={{ display: "flex", gap: 28, marginTop: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Date of Birth", value: formatDate(pet.date_of_birth), icon: "bi-calendar2" },
                  { label: "Microchip ID",  value: pet.microchip ?? "—",          icon: "bi-upc-scan"  },
                  { label: "Owner",         value: pet.users?.full_name ?? "—",   icon: "bi-person"    },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                      <i className={`bi ${f.icon}`} style={{ fontSize: 12, color: "#94a3b8" }} /> {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "inline-flex", height: 38, alignItems: "center", background: "#f1f5f9", borderRadius: 8, padding: "2px", gap: 2 }}>
          {(["overview", "visits", "vaccinations"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: "inline-flex", alignItems: "center", padding: "0 18px", height: 32,
              fontSize: 14, fontWeight: 500, borderRadius: 6, cursor: "pointer", border: "none",
              fontFamily: "inherit", transition: "all 0.15s",
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#0f172a" : "#64748b",
              boxShadow: tab === t ? "0 1px 4px rgb(0 0 0 / 0.08)" : "none",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <CardHeader><CardTitle>Owner Contact</CardTitle></CardHeader>
            <CardContent>
              <Separator style={{ margin: "12px 0" }} />
              <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8" }}>
                <i className="bi bi-person-x" style={{ fontSize: 28 }} />
                <p style={{ fontSize: 13, margin: "10px 0 0", color: "#64748b" }}>Contact details not available in POC</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Next Appointment</CardTitle></CardHeader>
            <CardContent>
              <Separator style={{ margin: "12px 0" }} />
              <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8" }}>
                <i className="bi bi-calendar-x" style={{ fontSize: 28 }} />
                <p style={{ fontSize: 13, margin: "10px 0 0", color: "#64748b" }}>No upcoming appointment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visits */}
      {tab === "visits" && (
        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
            <CardDescription>Complete clinical record of past visits</CardDescription>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <p style={{ fontSize: 14, color: "#94a3b8", padding: "20px 0" }}>No visits recorded.</p>
            ) : (
              <div style={{ marginTop: 8 }}>
                {visits.map((v, i) => (
                  <div key={v.id} style={{ position: "relative", paddingLeft: 28, paddingBottom: i < visits.length - 1 ? 28 : 0 }}>
                    {i < visits.length - 1 && (
                      <div style={{ position: "absolute", left: 6, top: 14, bottom: 0, width: 1, background: "#e2e8f0" }} />
                    )}
                    <div style={{
                      position: "absolute", left: 0, top: 5, width: 13, height: 13,
                      borderRadius: "50%", background: accent, border: "2px solid white",
                      boxShadow: `0 0 0 2px ${accent}40`,
                    }} />
                    <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{v.diagnosis ?? v.chief_complaint ?? "Visit"}</span>
                          <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 10 }}>{v.users?.full_name ?? "—"}</span>
                        </div>
                        <Badge variant="secondary">{formatDate(v.visited_at)}</Badge>
                      </div>
                      {v.treatment && (
                        <p style={{ fontSize: 13, color: "#475569", margin: "8px 0 0", lineHeight: 1.6 }}>{v.treatment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vaccinations */}
      {tab === "vaccinations" && (
        <Card>
          <CardHeader>
            <CardTitle>Vaccination Record</CardTitle>
            <CardDescription>Immunisation history and upcoming due dates</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: "12px 0 0" }}>
            {vaccinations.length === 0 ? (
              <p style={{ fontSize: 14, color: "#94a3b8", padding: "20px 20px" }}>No vaccinations recorded.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {["Vaccine", "Date Administered", "Next Due", "Administered By", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "9px 20px", fontWeight: 500, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map(v => {
                    const overdue = v.next_due_at ? new Date(v.next_due_at) < new Date() : false
                    return (
                      <tr key={v.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "13px 20px", fontWeight: 500 }}>{v.vaccine_name}</td>
                        <td style={{ padding: "13px 20px", color: "#475569" }}>{formatDate(v.administered_at)}</td>
                        <td style={{ padding: "13px 20px", color: overdue ? "#dc2626" : "#475569", fontWeight: overdue ? 500 : 400 }}>{formatDate(v.next_due_at)}</td>
                        <td style={{ padding: "13px 20px", color: "#475569" }}>{v.users?.full_name ?? "—"}</td>
                        <td style={{ padding: "13px 20px" }}>
                          <Badge variant={overdue ? "destructive" : "success"}>{overdue ? "Overdue" : "Current"}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
