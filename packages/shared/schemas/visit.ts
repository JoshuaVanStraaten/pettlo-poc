import { z } from 'zod'

export const CreateVisitSchema = z.object({
  clinic_id: z.string().uuid(),
  pet_id: z.string().uuid(),
  vet_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  visited_at: z.string().datetime().optional(),
  chief_complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateVisitSchema = CreateVisitSchema.partial()

export type CreateVisit = z.infer<typeof CreateVisitSchema>
export type UpdateVisit = z.infer<typeof UpdateVisitSchema>
