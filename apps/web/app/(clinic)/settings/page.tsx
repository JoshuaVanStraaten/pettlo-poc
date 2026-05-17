import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Settings</h1>
      <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 24px" }}>Manage clinic preferences and configuration</p>
      <Card>
        <CardContent style={{ padding: 40, textAlign: "center" }}>
          <i className="bi bi-gear" style={{ fontSize: 40, color: "#cbd5e1" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", margin: "16px 0 4px" }}>Settings coming soon</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>This section is under construction.</p>
        </CardContent>
      </Card>
    </div>
  )
}
