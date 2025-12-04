/* * */

import { z } from 'zod';

/* * */

export const PerformancePermissionSchema = z.object({
	action: z.enum([
		'read',
	]),
	scope: z.literal('performance'),
});

export type PerformancePermission = z.infer<typeof PerformancePermissionSchema>;
