/* * */

import { z } from 'zod';

/* * */

export const PermissionSchema = z.object({
	action: z.string(),
	resource: z.record(z.any()).nullish(),
	scope: z.string(),
});

export interface Permission<T> {
	action: string
	resource?: Partial<Record<keyof T, T[keyof T]>>
	scope: string
}
