export const runtime = "edge"

import { Resend } from "resend"
import { getAuthUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { CreateAppointmentSchema } from "@pettlo/shared/schemas"

export async function GET(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("pet_id")
    const status = searchParams.get("status")

    let query = supabase
      .from("appointments")
      .select("*, pets(*), users!appointments_vet_id_fkey(*)")
      .eq("clinic_id", userRecord.clinic_id!)
      .order("scheduled_at", { ascending: false })

    if (petId) query = query.eq("pet_id", petId)
    if (status) query = query.eq("status", status as "pending" | "confirmed" | "completed" | "cancelled" | "no_show")

    const { data, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (res) {
    return res as Response
  }
}

export async function POST(request: Request) {
  try {
    const { userRecord } = await getAuthUser(request)
    const supabase = createServiceClient()

    const body = await request.json()
    const parsed = CreateAppointmentSchema.safeParse({
      ...body,
      clinic_id: userRecord.clinic_id,
    })
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { data: appt, error } = await supabase
      .from("appointments")
      .insert(parsed.data)
      .select()
      .single()

    if (error || !appt) return Response.json({ error: error?.message }, { status: 500 })

    // Insert booking_confirmed notification row
    await supabase.from("notifications").insert({
      clinic_id: appt.clinic_id,
      appointment_id: appt.id,
      type: "booking_confirmed",
      channel: "email",
      recipient_email: userRecord.email,
      status: "pending",
      payload: { appointment_id: appt.id },
    })

    // Fire booking confirmation email with .ics attachment (fire-and-forget)
    sendBookingConfirmationEmail(appt, userRecord.email).catch(() => {
      // Non-fatal — notification row already inserted with status=pending
    })

    return Response.json(appt, { status: 201 })
  } catch (res) {
    return res as Response
  }
}

async function sendBookingConfirmationEmail(
  appt: {
    id: string
    clinic_id: string
    pet_id: string
    vet_id: string
    scheduled_at: string
    duration_min: number
    reason: string | null
  },
  recipientEmail: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@pettlo.com"

  // Fetch clinic, pet, and vet details for the email body
  const supabase = createServiceClient()
  const [clinicRes, petRes, vetRes] = await Promise.all([
    supabase.from("clinics").select("name").eq("id", appt.clinic_id).single(),
    supabase.from("pets").select("name, species").eq("id", appt.pet_id).single(),
    supabase.from("users").select("full_name").eq("id", appt.vet_id).single(),
  ])

  const clinicName = clinicRes.data?.name ?? "the clinic"
  const petName = petRes.data?.name ?? "your pet"
  const petSpecies = petRes.data?.species ?? ""
  const vetName = vetRes.data?.full_name ?? "Unknown"

  const scheduledAt = new Date(appt.scheduled_at)
  const dateStr = scheduledAt.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const icsContent = buildIcs({
    uid: appt.id,
    summary: `Vet appointment: ${petName} at ${clinicName}`,
    description: appt.reason ?? `Appointment for ${petName} (${petSpecies})`,
    start: scheduledAt,
    durationMin: appt.duration_min,
    location: clinicName,
  })

  await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject: `Booking confirmed: ${petName} at ${clinicName}`,
    html: `
      <p>Your appointment has been confirmed. Details below:</p>
      <ul>
        <li><strong>Clinic:</strong> ${clinicName}</li>
        <li><strong>Patient:</strong> ${petName} (${petSpecies})</li>
        <li><strong>Vet:</strong> ${vetName}</li>
        <li><strong>Date:</strong> ${dateStr}</li>
        <li><strong>Duration:</strong> ${appt.duration_min} min</li>
        ${appt.reason ? `<li><strong>Reason:</strong> ${appt.reason}</li>` : ""}
      </ul>
      <p>The calendar invite is attached. Add it to your calendar to get a reminder.</p>
      <p>— The Pettlo Team</p>
    `,
    attachments: [
      {
        filename: "appointment.ics",
        content: icsContent,
      },
    ],
  })

  // Update notification status to sent
  await supabase
    .from("notifications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("appointment_id", appt.id)
    .eq("type", "booking_confirmed")
}

function buildIcs({
  uid,
  summary,
  description,
  start,
  durationMin,
  location,
}: {
  uid: string
  summary: string
  description: string
  start: Date
  durationMin: number
  location: string
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  const end = new Date(start.getTime() + durationMin * 60 * 1000)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pettlo//Appointment//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}@pettlo.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
