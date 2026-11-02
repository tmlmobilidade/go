/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1TripsSchema = z.object({
	direction_id: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1'])),
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().default(''),
	trip_id: z.string(),
	wheelchair_accessible: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1', '2'])).default('0'),
});

export type OperationPostersV1Trips = z.output<typeof OperationPostersV1TripsSchema>;
