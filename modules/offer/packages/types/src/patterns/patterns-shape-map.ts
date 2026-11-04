/* * */

import { z } from 'zod';

/* * */

export const PatternsShapeMapItemSchema = z.object({
	agency_id: z.string(),
	color: z.string(),
	destination: z.string(),
	encoded_polyline: z.string(),
	headsign: z.string(),
	line_code: z.string(),
	line_id: z.string(),
	line_name: z.string(),
	line_text_color: z.string(),
	origin: z.string(),
	pattern_code: z.string(),
	pattern_id: z.string(),
	route_id: z.string(),
});

export const PatternsShapeMapQuerySchema = z.object({
	agency_ids: z.string().optional(),
});

export type PatternsShapeMapItem = z.infer<typeof PatternsShapeMapItemSchema>;
export type PatternsShapeMapQuery = z.infer<typeof PatternsShapeMapQuerySchema>;
