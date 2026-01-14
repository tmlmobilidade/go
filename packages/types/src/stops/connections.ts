/* * */

import { z } from 'zod';

/* * */

export const StopConnectionValues = [
	'ferry',
	'light_rail',
	'subway',
	'train',
	'boat',
	'airport',
	'bike_sharing',
	'bike_parking',
	'car_parking',
] as const;

export const StopConnectionSchema = z.enum(StopConnectionValues);

export type StopConnection = z.infer<typeof StopConnectionSchema>;
