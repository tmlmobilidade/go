/* * */

import { z } from 'zod';

/* * */

export const TransitModeValues = [
	'bus',
	'subway',
	'train',
	'ferry',
] as const;

export const TransitModeSchema = z.enum(TransitModeValues);

export type TransitMode = z.infer<typeof TransitModeSchema>;
