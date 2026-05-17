import { z } from 'zod'

export const NotificationChannelSchema = z.enum(['email', 'sms'])
export const NotificationTypeSchema = z.enum([
  'booking_confirmed',
  'reminder_24h',
  'reminder_1h',
  'cancelled',
])
export const NotificationStatusSchema = z.enum(['pending', 'sent', 'failed'])

export const CreateNotificationSchema = z.object({
  clinic_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  recipient_email: z.string().email(),
  channel: NotificationChannelSchema.default('email'),
  type: NotificationTypeSchema,
  status: NotificationStatusSchema.default('pending'),
  payload: z.record(z.unknown()).optional(),
  sent_at: z.string().datetime().optional(),
  error: z.string().optional(),
})

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>
export type NotificationType = z.infer<typeof NotificationTypeSchema>
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>
export type CreateNotification = z.infer<typeof CreateNotificationSchema>
