export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/service"
import { PetProfile } from "@/components/pet-profile"

export default async function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const [petResult, visitsResult, vacsResult] = await Promise.all([
    supabase
      .from("pets")
      .select("id, name, species, breed, date_of_birth, microchip, users!pets_owner_id_fkey(full_name, email)")
      .eq("id", id)
      .single(),
    supabase
      .from("visits")
      .select("id, visited_at, chief_complaint, diagnosis, treatment, users!visits_vet_id_fkey(full_name)")
      .eq("pet_id", id)
      .is("deleted_at", null)
      .order("visited_at", { ascending: false }),
    supabase
      .from("vaccinations")
      .select("id, vaccine_name, administered_at, next_due_at, users!vaccinations_vet_id_fkey(full_name)")
      .eq("pet_id", id)
      .order("administered_at", { ascending: false }),
  ])

  if (!petResult.data) notFound()

  return (
    <PetProfile
      pet={petResult.data as any}
      visits={(visitsResult.data ?? []) as any}
      vaccinations={(vacsResult.data ?? []) as any}
    />
  )
}
