export const runtime = "edge"

import { getAuthUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/service"
import { CreatePetSchema } from "@pettlo/shared/schemas"

export async function GET(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("owner_id")

    let query = supabase.from("pets").select("*")

    if (userRecord.role === "owner") {
      query = query.eq("owner_id", userRecord.id)
    } else if (ownerId) {
      query = query.eq("owner_id", ownerId)
    }

    const { data, error } = await query.order("name")

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
    const parsed = CreatePetSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const ownerId =
      userRecord.role === "owner" ? userRecord.id : parsed.data.owner_id

    const { data, error } = await supabase
      .from("pets")
      .insert({ ...parsed.data, owner_id: ownerId! })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data, { status: 201 })
  } catch (res) {
    return res as Response
  }
}
