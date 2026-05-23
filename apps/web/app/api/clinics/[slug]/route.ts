
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return Response.json({ error: "Clinic not found" }, { status: 404 })
  }

  return Response.json(data)
}
