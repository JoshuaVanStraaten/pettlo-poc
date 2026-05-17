import { z } from 'zod'

export const PetSexSchema = z.enum(['male', 'female', 'unknown'])

export const CreatePetSchema = z.object({
  owner_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  species: z.string().min(1).max(100),
  breed: z.string().max(100).optional(),
  sex: PetSexSchema.default('unknown'),
  date_of_birth: z.string().date().optional(),
  weight_kg: z.number().positive().optional(),
  microchip: z.string().max(100).optional(),
  notes: z.string().optional(),
})

export const UpdatePetSchema = CreatePetSchema.partial()

export type PetSex = z.infer<typeof PetSexSchema>
export type CreatePet = z.infer<typeof CreatePetSchema>
export type UpdatePet = z.infer<typeof UpdatePetSchema>
