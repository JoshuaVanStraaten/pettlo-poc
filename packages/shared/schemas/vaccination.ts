import { z } from 'zod'

export const CreateVaccinationSchema = z.object({
  clinic_id: z.string().uuid(),
  pet_id: z.string().uuid(),
  vet_id: z.string().uuid(),
  visit_id: z.string().uuid().optional(),
  vaccine_name: z.string().min(1).max(255),
  administered_at: z.string().datetime().optional(),
  next_due_at: z.string().datetime().optional(),
  batch_number: z.string().max(100).optional(),
  notes: z.string().optional(),
})

export const UpdateVaccinationSchema = CreateVaccinationSchema.partial()

export type CreateVaccination = z.infer<typeof CreateVaccinationSchema>
export type UpdateVaccination = z.infer<typeof UpdateVaccinationSchema>
