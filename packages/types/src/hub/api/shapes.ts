/* * */

import { type Feature, type LineString } from 'geojson';
import { z } from 'zod';

/* * */

export const HubShapePointSchema = z.object({
	shape_dist_traveled: z.number(),
	shape_pt_lat: z.number(),
	shape_pt_lon: z.number(),
	shape_pt_sequence: z.number(),
});

/**
 * Publishable shape point data for the Hub Shapes API.
 */
export type HubShapePoint = z.infer<typeof HubShapePointSchema>;

/* * */

export const HubShapeSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	extension: z.number(),
	points: z.array(HubShapePointSchema),
});

/**
 * Publishable shape data for the Hub Shapes API.
 */
export type HubShape = z.infer<typeof HubShapeSchema> & {
	geojson: Feature<LineString>
};

