import { AvatarBadge } from "@/components/ui/avatar-badge"

export function TopBar() {
  return (
    <div style={{
      height: 56, background: "white", borderBottom: "1px solid #f1f5f9",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1.5px dashed #cbd5e1", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#94a3b8", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.04em", userSelect: "none",
        }}>
          LOGO
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>Sunrise Veterinary Clinic</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Springfield, IL</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "#f1f5f9", color: "#475569", borderRadius: 9999,
          padding: "3px 10px", fontSize: 12, fontWeight: 500,
        }}>
          <i className="bi bi-person-badge" style={{ fontSize: 12 }} /> Clinic Staff
        </span>
        <AvatarBadge name="Emily Clarke" size={34} />
      </div>
    </div>
  )
}
