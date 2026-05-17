import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
