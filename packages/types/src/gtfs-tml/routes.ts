/* * */

import { GtfsPathTypeSchema } from '@/gtfs-new/path-type.js';
import { GtfsRouteSchema } from '@/gtfs-new/routes.js';
import { z } from 'zod';

/* * */

export const GtfsTMLRouteSchema = GtfsRouteSchema.extend({
	circular: z.number().nullish(),
	line_id: z.number(),
	line_long_name: z.string(),
	line_short_name: z.string(),
	line_type: z.number(),
	path_type: GtfsPathTypeSchema.nullish(),
	route_destination: z.string().optional(),
	route_origin: z.string().optional(),
	route_remarks: z.string().nullish(),
	school: z.number().nullish(),
});
export type GtfsTMLRoute = z.infer<typeof GtfsTMLRouteSchema>;
