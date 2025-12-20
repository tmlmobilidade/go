/* * */

import { z } from 'zod';

/* * */

export const AlertTypeValues = [
	'scheduled',
	'realtime',
] as const;

export const AlertTypeSchema = z.enum(AlertTypeValues);

export type AlertType = z.infer<typeof AlertTypeSchema>;
