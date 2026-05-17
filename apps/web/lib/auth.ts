import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { Database } from "@/lib/supabase/types"

type UserRecord = Database["public"]["Tables"]["users"]["Row"]

const POC_ADMIN_ID = '00000000-0000-0000-0001-000000000001'

export async function getAuthUser(
  _request: Request
): Promise<{ user: { id: string; email: string }; userRecord: UserRecord }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!authError && user) {
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!userError && userRecord) {
      return { user: { id: user.id, email: user.email! }, userRecord }
    }
  }

  // POC dev bypass: no auth session → use seed admin
  if (process.env.NODE_ENV !== 'production') {
    const service = createServiceClient()
    const { data: userRecord } = await service
      .from("users")
      .select("*")
      .eq("id", POC_ADMIN_ID)
      .single()

    if (userRecord) {
      return {
        user: { id: userRecord.id, email: userRecord.email },
        userRecord,
      }
    }
  }

  throw new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  })
}
