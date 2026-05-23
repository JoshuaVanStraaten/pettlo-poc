export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"
import { CreateVaccinationSchema } from "@pettlo/shared/schemas"

export async function GET(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("pet_id")

    let query = supabase
      .from("vaccinations")
      .select("*")
      .eq("clinic_id", userRecord.clinic_id!)
      .order("administered_at", { ascending: false })

    if (petId) query = query.eq("pet_id", petId)

    const { data, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (res) {
    return res as Response
  }
}

export async function POST(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const body = await request.json()
    const parsed = CreateVaccinationSchema.safeParse({
      ...body,
      clinic_id: userRecord.clinic_id,
      vet_id: userRecord.id,
    })
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { data, error } = await supabase
      .from("vaccinations")
      .insert(parsed.data)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data, { status: 201 })
  } catch (res) {
    return res as Response
  }
}
