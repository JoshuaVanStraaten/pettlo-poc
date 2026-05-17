import { z } from 'zod'

export const UserRoleSchema = z.enum(['owner', 'vet', 'receptionist', 'clinic_admin', 'superadmin'])

export const CreateUserSchema = z.object({
  clinic_id: z.string().uuid().nullable().optional(),
  auth_id: z.string().uuid().optional(),
  email: z.string().email(),
  full_name: z.string().min(1).max(255),
  role: UserRoleSchema,
})

export type UserRole = z.infer<typeof UserRoleSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
