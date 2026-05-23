export const runtime = "edge"

import { Resend } from "resend"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const supabase = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@pettlo.com"

  const body = await request.json()
  const { notification_id } = body

  if (!notification_id) {
    return Response.json({ error: "notification_id required" }, { status: 400 })
  }

  const { data: notification, error: fetchError } = await supabase
    .from("notifications")
    .select("*, appointments(*, pets(*), users!appointments_vet_id_fkey(*), clinics(*))")
    .eq("id", notification_id)
    .single()

  if (fetchError || !notification) {
    return Response.json({ error: "Notification not found" }, { status: 404 })
  }

  let emailError: string | null = null

  try {
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: notification.recipient_email,
      subject: buildSubject(notification),
      html: buildHtml(notification),
    })
    if (sendError) emailError = sendError.message
  } catch (err) {
    emailError = err instanceof Error ? err.message : "Unknown send error"
  }

  const { error: updateError } = await supabase
    .from("notifications")
    .update({
      status: emailError ? "failed" : "sent",
      sent_at: emailError ? null : new Date().toISOString(),
      error: emailError,
    })
    .eq("id", notification_id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  if (emailError) {
    return Response.json({ ok: false, error: emailError }, { status: 500 })
  }

  return Response.json({ ok: true })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSubject(notification: any): string {
  const appt = notification.appointments
  const pet = appt?.pets
  const clinic = appt?.clinics
  switch (notification.type) {
    case "booking_confirmed":
      return `Booking confirmed for ${pet?.name ?? "your pet"} at ${clinic?.name ?? "the clinic"}`
    case "reminder_24h":
      return `Reminder: ${pet?.name ?? "Patient"} appointment tomorrow`
    case "reminder_1h":
      return `Reminder: ${pet?.name ?? "Patient"} appointment in 1 hour`
    case "cancelled":
      return `Appointment cancelled for ${pet?.name ?? "your pet"}`
    default:
      return "Notification from Pettlo"
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHtml(notification: any): string {
  const appt = notification.appointments
  const pet = appt?.pets
  const vet = appt?.users
  const clinic = appt?.clinics

  if (!appt) {
    return `<p>You have a notification from Pettlo.</p>`
  }

  const scheduledAt = new Date(appt.scheduled_at)
  const dateStr = scheduledAt.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  })

  return `
    <p>Dear ${notification.recipient_email},</p>
    <p>${typeMessage(notification.type)}</p>
    <ul>
      <li><strong>Clinic:</strong> ${clinic?.name ?? "–"}</li>
      <li><strong>Patient:</strong> ${pet?.name ?? "Unknown"} (${pet?.species ?? ""})</li>
      <li><strong>Vet:</strong> ${vet?.full_name ?? "Unknown"}</li>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Duration:</strong> ${appt.duration_min} min</li>
      ${appt.reason ? `<li><strong>Reason:</strong> ${appt.reason}</li>` : ""}
    </ul>
    <p>If you have questions, please contact the clinic.</p>
    <p>— The Pettlo Team</p>
  `
}

function typeMessage(type: string): string {
  switch (type) {
    case "booking_confirmed":
      return "Your appointment has been confirmed. Details below:"
    case "reminder_24h":
      return "This is a reminder — your appointment is tomorrow:"
    case "reminder_1h":
      return "Your appointment starts in 1 hour:"
    case "cancelled":
      return "Your appointment has been cancelled. Details below:"
    default:
      return "You have a notification from Pettlo:"
  }
}
