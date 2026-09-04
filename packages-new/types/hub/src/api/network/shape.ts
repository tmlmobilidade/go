/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { type Feature, type LineString } from 'geojson';
import { z } from 'zod';

/* * */

export const HubShapeGeoJsonSchema = z.object({
	geometry: z.object({
		coordinates: z.array(z.tuple([z.number(), z.number()])),
		type: z.literal('LineString'),
	}),
	properties: z.record(z.string(), z.any()).optional(),
	type: z.literal('Feature'),
});

export const HubShapePointSchema = z.object({
	shape_dist_traveled: z.number(),
	shape_pt_lat: z.number(),
	shape_pt_lon: z.number(),
	shape_pt_sequence: z.number(),
});

/**
 * Shape point data for the Hub Network API.
 */
export type HubShapePoint = z.infer<typeof HubShapePointSchema>;

/* * */

export const HubShapeSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	encoded_polyline: z.string().optional(),
	extension: NonNegativeIntegerSchema,
	geojson: HubShapeGeoJsonSchema,
	points: z.array(HubShapePointSchema),
	shape_polyline: z.string().optional(),
});

/**
 * GeoJSON feature for a Hub network shape line.
 */
export type HubShapeGeoJson = Feature<LineString>;

/**
 * Shape data for the Hub Network API.
 */
export type HubShape = Omit<z.infer<typeof HubShapeSchema>, 'geojson'> & {
	geojson: HubShapeGeoJson
};
