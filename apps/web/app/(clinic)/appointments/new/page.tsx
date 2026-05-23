export const dynamic = 'force-dynamic'

import { createServiceClient } from "@/lib/supabase/service"
import { AppointmentForm } from "@/components/appointment-form"

export default async function NewAppointmentPage() {
  const supabase = createServiceClient()

  const [petsResult, vetsResult] = await Promise.all([
    supabase
      .from("pets")
      .select("id, name, users!pets_owner_id_fkey(full_name)")
      .order("name"),
    supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "vet")
      .order("full_name"),
  ])

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Book Appointment</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>Schedule a new clinic visit</p>
      </div>
      <AppointmentForm
        pets={(petsResult.data ?? []) as any}
        vets={(vetsResult.data ?? []) as any}
      />
    </div>
  )
}
