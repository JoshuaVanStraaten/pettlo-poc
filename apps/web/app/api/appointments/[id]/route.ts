export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"
import { UpdateAppointmentSchema } from "@pettlo/shared/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser(request)
    const supabase = createServiceClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("appointments")
      .select("*, pets(*), users!appointments_vet_id_fkey(*)")
      .eq("id", id)
      .single()

    if (error || !data) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(data)
  } catch (res) {
    return res as Response
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser(request)
    const supabase = createServiceClient()
    const { id } = await params

    const body = await request.json()
    const parsed = UpdateAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single()

    if (error || !data) return Response.json({ error: error?.message ?? "Not found" }, { status: 404 })
    return Response.json(data)
  } catch (res) {
    return res as Response
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser(request)
    const supabase = createServiceClient()
    const { id } = await params

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return new Response(null, { status: 204 })
  } catch (res) {
    return res as Response
  }
}
