/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationSchema = DocumentSchema.extend({
	is_read: z.boolean(),
	payload: z.object({
		body: z.string().min(1),
		href: z.string().url().optional(),
		icon: z.string().optional(),
		title: z.string().min(1),
	}),
	priority: z.enum(['high', 'normal', 'low']).default('normal'),
	scope: z.string().min(1), // e.g., 'agencies', 'alerts', 'auth'
	topic: z.string().min(1), // e.g., 'new_alert', 'plan_update'
	user_id: z.string().optional(), // Id of the user this notification belongs to
}).strict();

/* * */

export const CreateNotificationSchema = NotificationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateNotificationSchema = CreateNotificationSchema.omit({ created_by: true }).partial();

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;

/* * */

export const NotificationPermissionSchema = z.object({
	send_mail: z.boolean().default(false).nullish(),
});

export type NotificationPermission = z.infer<typeof NotificationPermissionSchema>;
