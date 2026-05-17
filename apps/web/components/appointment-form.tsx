"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

type Pet = { id: string; name: string; users: { full_name: string } | null }
type Vet = { id: string; full_name: string }

const TIME_SLOTS = (() => {
  const slots: string[] = []
  for (let h = 9; h <= 17; h++) {
    for (const m of ["00", "30"]) {
      if (h === 17 && m === "30") continue
      const ampm = h < 12 ? "AM" : "PM"
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${h12}:${m} ${ampm}`)
    }
  }
  return slots
})()

function timeSlotToISO(date: string, slot: string): string {
  const match = slot.match(/^(\d+):(\d{2})\s(AM|PM)$/)
  if (!match) return ""
  let hours = parseInt(match[1])
  const minutes = match[2]
  const ampm = match[3]
  if (ampm === "PM" && hours !== 12) hours += 12
  if (ampm === "AM" && hours === 12) hours = 0
  return new Date(`${date}T${String(hours).padStart(2, "0")}:${minutes}:00`).toISOString()
}

const EMPTY = { pet_id: "", vet_id: "", date: "", time: "", duration: "30", notes: "" }

export function AppointmentForm({ pets, vets }: { pets: Pet[]; vets: Vet[] }) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.pet_id) e.pet_id = "Please select a pet"
    if (!form.vet_id) e.vet_id = "Please select a veterinarian"
    if (!form.date)   e.date   = "Please select a date"
    if (!form.time)   e.time   = "Please select a time slot"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const scheduled_at = timeSlotToISO(form.date, form.time)
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: form.pet_id,
          vet_id: form.vet_id,
          scheduled_at,
          duration_min: parseInt(form.duration),
          reason: form.notes || undefined,
          clinic_id: "00000000-0000-0000-0000-000000000001",
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error("Failed to book appointment", { description: JSON.stringify(err) })
        return
      }
      toast.success("Appointment booked!", { description: "The appointment has been successfully scheduled." })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Card>
      <CardContent style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Pet */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Label htmlFor="pet_id">Patient (Pet)</Label>
              <select
                id="pet_id"
                value={form.pet_id}
                onChange={e => set("pet_id", e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 14,
                  border: errors.pet_id ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                  background: "white", color: "#0f172a",
                }}
              >
                <option value="">Select a pet…</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.users?.full_name ?? "unknown owner"})</option>
                ))}
              </select>
              {errors.pet_id && <span style={{ fontSize: 12, color: "#dc2626" }}><i className="bi bi-exclamation-circle" /> {errors.pet_id}</span>}
            </div>

            {/* Vet */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Label htmlFor="vet_id">Veterinarian</Label>
              <select
                id="vet_id"
                value={form.vet_id}
                onChange={e => set("vet_id", e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 14,
                  border: errors.vet_id ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                  background: "white", color: "#0f172a",
                }}
              >
                <option value="">Select a vet…</option>
                {vets.map(v => (
                  <option key={v.id} value={v.id}>{v.full_name}</option>
                ))}
              </select>
              {errors.vet_id && <span style={{ fontSize: 12, color: "#dc2626" }}><i className="bi bi-exclamation-circle" /> {errors.vet_id}</span>}
            </div>

            {/* Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                min={today}
                onChange={e => set("date", e.target.value)}
                style={{ border: errors.date ? "1px solid #fca5a5" : undefined }}
              />
              {errors.date && <span style={{ fontSize: 12, color: "#dc2626" }}><i className="bi bi-exclamation-circle" /> {errors.date}</span>}
            </div>

            {/* Time */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Label htmlFor="time">Time Slot</Label>
              <select
                id="time"
                value={form.time}
                onChange={e => set("time", e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 14,
                  border: errors.time ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                  background: "white", color: "#0f172a",
                }}
              >
                <option value="">Select a time…</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time && <span style={{ fontSize: 12, color: "#dc2626" }}><i className="bi bi-exclamation-circle" /> {errors.time}</span>}
            </div>

            {/* Duration */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={form.duration}
                onChange={e => set("duration", e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 14,
                  border: "1px solid #e2e8f0", background: "white", color: "#0f172a",
                }}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: 20 }}>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Reason for visit, symptoms, special instructions…"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              style={{ minHeight: 100, marginTop: 5 }}
            />
          </div>

          <Separator style={{ margin: "24px 0" }} />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? <><i className="bi bi-arrow-repeat" style={{ marginRight: 6 }} />Booking…</>
                : <><i className="bi bi-calendar-check" style={{ marginRight: 6 }} />Book Appointment</>
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
