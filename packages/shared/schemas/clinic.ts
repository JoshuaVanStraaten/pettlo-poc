import { z } from 'zod'

export const CreateClinicSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en'),
})

export const UpdateClinicSchema = CreateClinicSchema.partial()

export type CreateClinic = z.infer<typeof CreateClinicSchema>
export type UpdateClinic = z.infer<typeof UpdateClinicSchema>
