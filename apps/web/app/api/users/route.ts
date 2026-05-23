export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let query = supabase
      .from("users")
      .select("id, full_name, role, email")
      .eq("clinic_id", userRecord.clinic_id!)

    if (role) query = query.eq("role", role as "owner" | "vet" | "receptionist" | "clinic_admin" | "superadmin")

    const { data, error } = await query.order("name")

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (res) {
    return res as Response
  }
}
