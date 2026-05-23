export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()
    const { id: petId } = await params

    const clinicId = userRecord.clinic_id
    if (!clinicId) {
      return Response.json({ error: "User has no clinic" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("clinic_pets")
      .insert({ pet_id: petId, clinic_id: clinicId })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data, { status: 201 })
  } catch (res) {
    return res as Response
  }
}
