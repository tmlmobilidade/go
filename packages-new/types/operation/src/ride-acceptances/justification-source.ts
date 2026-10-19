/* * */

import { z } from 'zod';

/* * */

export const RideJustificationSourceValues = [
	'manual',
	'alert',
] as const;

export const RideJustificationSourceSchema = z.enum(RideJustificationSourceValues);

export type RideJustificationSource = z.infer<typeof RideJustificationSourceSchema>;
