"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AvatarBadge } from "@/components/ui/avatar-badge"

type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
  users: { full_name: string } | null
}

const SPECIES_STYLE: Record<string, { bg: string; accent: string; badge: "primary" | "outline" | "success" }> = {
  Dog:    { bg: "#eff6ff", accent: "#1a7bbf", badge: "primary"  },
  Cat:    { bg: "#f5f3ff", accent: "#7c3aed", badge: "outline"  },
  Rabbit: { bg: "#f0fdf4", accent: "#059669", badge: "success"  },
}

function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const sp = SPECIES_STYLE[pet.species] ?? SPECIES_STYLE.Dog
  return (
    <Card onClick={onClick} style={{ cursor: "pointer", overflow: "hidden" }}>
      <div style={{
        height: 130,
        background: `linear-gradient(145deg, ${sp.bg} 0%, ${sp.accent}14 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <AvatarBadge name={pet.name} size={60} />
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Badge variant={sp.badge}>{pet.species}</Badge>
        </div>
      </div>
      <CardContent style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{pet.name}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{pet.breed ?? "Unknown breed"}</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748b" }}>
            <i className="bi bi-person" style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }} />
            {pet.users?.full_name ?? "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PetsGrid({ pets }: { pets: Pet[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")

  const filtered = pets.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.users?.full_name ?? "").toLowerCase().includes(q) || (p.breed ?? "").toLowerCase().includes(q)
    const matchSpecies = speciesFilter === "all" || p.species === speciesFilter
    return matchSearch && matchSpecies
  })

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <i className="bi bi-search" style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "#94a3b8", fontSize: 13, pointerEvents: "none",
          }} />
          <Input
            placeholder="Search by name, owner, or breed…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select
          value={speciesFilter}
          onChange={e => setSpeciesFilter(e.target.value)}
          style={{
            width: 160, padding: "0 12px", borderRadius: 6,
            border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a",
            background: "white", cursor: "pointer",
          }}
        >
          <option value="all">All species</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Rabbit">Rabbits</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
          <i className="bi bi-search" style={{ fontSize: 36 }} />
          <p style={{ margin: "14px 0 0", fontSize: 15, fontWeight: 500, color: "#64748b" }}>No pets found</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {filtered.map(pet => (
            <PetCard key={pet.id} pet={pet} onClick={() => router.push(`/pets/${pet.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
