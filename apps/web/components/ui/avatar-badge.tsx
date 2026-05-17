const PALETTE = [
  '#1a7bbf', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2',
]

function getColor(name: string) {
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase()
}

export function AvatarBadge({ name, size = 32 }: { name: string; size?: number }) {
  const bg = getColor(name)
  const initials = getInitials(name)
  const fontSize = Math.round(size * 0.38)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'white',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
