export const dynamic = 'force-dynamic'

import { createServiceClient } from "@/lib/supabase/service"
import { PetsGrid } from "@/components/pets-grid"

export default async function PetsPage() {
  const supabase = createServiceClient()

  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, species, breed, users!pets_owner_id_fkey(full_name)")
    .order("name")

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Pets</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>{pets?.length ?? 0} registered patients</p>
        </div>
      </div>
      <PetsGrid pets={(pets ?? []) as any} />
    </div>
  )
}
