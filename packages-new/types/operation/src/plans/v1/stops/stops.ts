/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1StopsSchema = z.object({
	location_type: z.union([z.string(), z.number()]).default('0').transform(value => value === '' ? '0' : String(value)).pipe(z.enum(['0', '1', '2', '3', '4'])),
	parent_station: z.string().default(''),
	platform_code: z.string().default(''),
	stop_code: z.string(),
	stop_id: z.string(),
	stop_lat: z.number().min(-90).max(90),
	stop_lon: z.number().min(-180).max(180),
	stop_name: z.string(),
	wheelchair_boarding: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1', '2'])).optional(),
});

export type OperationPostersV1Stops = z.output<typeof OperationPostersV1StopsSchema>;
