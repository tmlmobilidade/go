/* * */

import { z } from 'zod';

/* * */

const coordinatesSchema = z.tuple([z.number().finite(), z.number().finite()]);
const lineGeometrySchema = z.object({ coordinates: z.array(coordinatesSchema), type: z.literal('LineString') });
const summarySchema = z.object({ distance: z.number().finite().nonnegative(), duration: z.number().finite().nonnegative() });

export const RoutePreviewPointSchema = z.object({
	lat: z.number().finite().min(-90).max(90),
	lon: z.number().finite().min(-180).max(180),
	type: z.enum(['break', 'through', 'via']).default('break'),
});

export const ShapesRoutePreviewRequestSchema = z.object({
	costing: z.enum(['auto', 'bicycle', 'bus', 'pedestrian']).default('bus'),
	costing_options: z.object({ bus: z.object({ use_ferry: z.number().finite().min(0).max(1).optional() }).optional() }).optional(),
	pattern_id: z.string().trim().min(1),
	points: z.array(RoutePreviewPointSchema).min(2),
});

export const RoutePreviewLegSchema = summarySchema.extend({
	encoded_polyline: z.string().optional(),
	from_index: z.number().int().nonnegative(),
	geojson: z.object({
		geometry: lineGeometrySchema,
		properties: summarySchema.extend({ from_index: z.number().int().nonnegative(), to_index: z.number().int().nonnegative() }),
		type: z.literal('Feature'),
	}),
	geometry: z.array(coordinatesSchema),
	to_index: z.number().int().nonnegative(),
});

export const RoutePreviewResponseSchema = summarySchema.extend({
	encoded_polyline: z.string(),
	geojson: z.object({ geometry: lineGeometrySchema, properties: summarySchema, type: z.literal('Feature') }),
	geometry: z.array(coordinatesSchema),
	legs: z.array(RoutePreviewLegSchema),
});

export type ShapesRoutePreviewRequest = z.infer<typeof ShapesRoutePreviewRequestSchema>;
export type RoutePreviewPoint = z.infer<typeof RoutePreviewPointSchema>;
export type RoutePreviewLeg = z.infer<typeof RoutePreviewLegSchema>;
export type RoutePreviewResponse = z.infer<typeof RoutePreviewResponseSchema>;
