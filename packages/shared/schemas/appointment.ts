import { z } from 'zod'

export const AppointmentStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
])

export const CreateAppointmentSchema = z.object({
  clinic_id: z.string().uuid(),
  pet_id: z.string().uuid(),
  vet_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_min: z.number().int().positive().default(30),
  reason: z.string().optional(),
  status: AppointmentStatusSchema.default('pending'),
})

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>
