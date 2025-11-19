/* * */

import { z } from 'zod';

/* * */

export const AlertsScheduledPermissionSchema = z.object({
	action: z.enum(['create',
		'delete',
		'read',
		'toggle_lock',
		'update',
	]),
	scope: z.literal('alerts_scheduled'),
});

export type AlertsScheduledPermission = z.infer<typeof AlertsScheduledPermissionSchema>;

/* * */

export const AlertsRealtimePermissionSchema = z.object({
	action: z.enum(['create',
		'delete',
		'read',
		'toggle_lock',
		'update',
	]),
	scope: z.literal('alerts_realtime'),
});

export type AlertsRealtimePermission = z.infer<typeof AlertsRealtimePermissionSchema>;
