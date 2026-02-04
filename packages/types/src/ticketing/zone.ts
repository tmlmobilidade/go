/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

const PositionSchema = z.array(z.number()).min(2);
const LinearRingSchema = z.array(PositionSchema).min(4);
const PolygonCoordinatesSchema = z.array(LinearRingSchema).min(1);
const MultiPolygonCoordinatesSchema = z.array(PolygonCoordinatesSchema).min(1);

const GeometrySchema = z.union([
	z.object({
		coordinates: PolygonCoordinatesSchema,
		type: z.literal('Polygon'),
	}),
	z.object({
		coordinates: MultiPolygonCoordinatesSchema,
		type: z.literal('MultiPolygon'),
	}),
]);

const FeatureSchema = z.object({
	geometry: GeometrySchema,
	properties: z.record(z.any()).optional().nullable(),
	type: z.literal('Feature'),
});

const FeatureCollectionSchema = z.object({
	features: z.array(FeatureSchema).min(1),
	type: z.literal('FeatureCollection'),
});

const GeoJSONSchema = z.union([FeatureSchema, FeatureCollectionSchema]);

/* * */

export const ZoneSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1, 'At least one agency ID is required'),
	code: z.string().trim().min(1).max(30),
	geojson: GeoJSONSchema.nullable().default(null),
	is_locked: z.boolean().default(false),
	name: z.string().trim().min(1).max(50),
});

/* * */

// Only name, code, and agency_ids are required for creation
export const CreateZoneSchema = z.object({
	agency_ids: ZoneSchema.shape.agency_ids,
	code: ZoneSchema.shape.code,
	name: ZoneSchema.shape.name,
}).merge(
	ZoneSchema.omit({
		agency_ids: true,
		code: true,
		created_at: true,
		name: true,
		updated_at: true,
	}).partial(),
);

export const UpdateZoneSchema = CreateZoneSchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Zone = z.infer<typeof ZoneSchema>;
export type CreateZoneDto = z.infer<typeof CreateZoneSchema>;
export type UpdateZoneDto = z.infer<typeof UpdateZoneSchema>;
