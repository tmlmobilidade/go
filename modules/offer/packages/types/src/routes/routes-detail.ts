/* * */

import { PatternSchema, RouteSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const RoutesDetailPatternSchema = PatternSchema.pick({
	_id: true,
	code: true,
	destination: true,
	headsign: true,
	line_id: true,
	origin: true,
	route_id: true,
});

/** Pattern summaries are fetched for the API response, not stored in the route. */
export const RoutesDetailSchema = RouteSchema.extend({
	patterns: z.array(RoutesDetailPatternSchema),
});

export type RoutesDetail = z.infer<typeof RoutesDetailSchema>;
