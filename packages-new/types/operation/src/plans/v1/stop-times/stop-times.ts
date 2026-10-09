/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1StopTimesSchema = z.object({
	arrival_time: z.string().regex(/^\d{2}:[0-5]\d:[0-5]\d$/),
	departure_time: z.string().regex(/^\d{2}:[0-5]\d:[0-5]\d$/),
	drop_off_type: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1', '2', '3'])).default('1'),
	pickup_type: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1', '2', '3'])).default('1'),
	shape_dist_traveled: z.number().nonnegative().default(0),
	stop_id: z.string(),
	stop_sequence: z.number().int().nonnegative(),
	timepoint: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1'])).default('0'),
	trip_id: z.string(),
});

export type OperationPostersV1StopTimes = z.output<typeof OperationPostersV1StopTimesSchema>;
