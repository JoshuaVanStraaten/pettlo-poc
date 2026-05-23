export const runtime = "edge"

import { Resend } from "resend"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const supabase = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@pettlo.com"

  const now = new Date()
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // Fetch upcoming appointments in the next 24h that haven't had a reminder sent
  const { data: appointments, error: fetchError } = await supabase
    .from("appointments")
    .select(`
      id, scheduled_at, duration_min, reason, clinic_id,
      pets ( name, species ),
      users!appointments_vet_id_fkey ( full_name, email ),
      clinics ( name )
    `)
    .eq("status", "confirmed")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", windowEnd.toISOString())

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    return Response.json({ sent: 0 })
  }

  // Filter out appointments that already have a reminder_24h notification
  const apptIds = appointments.map((a) => a.id)
  const { data: existingReminders } = await supabase
    .from("notifications")
    .select("appointment_id")
    .in("appointment_id", apptIds)
    .eq("type", "reminder_24h")

  const alreadyRemindered = new Set(
    (existingReminders ?? []).map((n) => n.appointment_id)
  )

  const pending = appointments.filter((a) => !alreadyRemindered.has(a.id))

  let sent = 0
  let failed = 0

  for (const appt of pending) {
    const pet = appt.pets as { name: string; species: string } | null
    const vet = appt.users as { full_name: string; email: string } | null
    const clinic = appt.clinics as { name: string } | null

    const scheduledAt = new Date(appt.scheduled_at)
    const dateStr = scheduledAt.toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
    })

    const recipientEmail = vet?.email
    if (!recipientEmail) continue

    let emailError: string | null = null

    try {
      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `Reminder: ${pet?.name ?? "Patient"} appointment tomorrow`,
        html: `
          <p>This is a reminder for an upcoming appointment at <strong>${clinic?.name ?? "the clinic"}</strong>.</p>
          <ul>
            <li><strong>Patient:</strong> ${pet?.name ?? "Unknown"} (${pet?.species ?? ""})</li>
            <li><strong>Vet:</strong> ${vet?.full_name ?? "Unknown"}</li>
            <li><strong>Date:</strong> ${dateStr}</li>
            <li><strong>Duration:</strong> ${appt.duration_min} min</li>
            ${appt.reason ? `<li><strong>Reason:</strong> ${appt.reason}</li>` : ""}
          </ul>
          <p>Please arrive 10 minutes early. Contact the clinic to reschedule if needed.</p>
        `,
      })
      if (sendError) emailError = sendError.message
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown error"
    }

    await supabase.from("notifications").insert({
      clinic_id: appt.clinic_id,
      appointment_id: appt.id,
      type: "reminder_24h",
      channel: "email",
      recipient_email: recipientEmail,
      status: emailError ? "failed" : "sent",
      sent_at: emailError ? null : new Date().toISOString(),
      error: emailError,
      payload: { appointment_id: appt.id },
    })

    if (emailError) {
      failed++
    } else {
      sent++
    }
  }

  return Response.json({ sent, failed, skipped: alreadyRemindered.size })
}
