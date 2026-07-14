/* * */

import { z } from 'zod';

/* * */

export const ServiceAllSchema = z.object({
	agency_id: z.string(),
	line_id: z.number(),
	operational_date: z.string(),
	pass_trip_count: z.number(),
	pass_trip_percentage: z.number(),
	total_trip_count: z.number(),
	updated_at: z.string(),
});

export type ServiceAll = z.infer<typeof ServiceAllSchema>;
