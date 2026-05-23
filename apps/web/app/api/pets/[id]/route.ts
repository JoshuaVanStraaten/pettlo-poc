export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"
import { UpdatePetSchema } from "@pettlo/shared/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthUser(request)
    const supabase = createServiceClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("pets")
      .select("*")
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
    const parsed = UpdatePetSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { data, error } = await supabase
      .from("pets")
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
