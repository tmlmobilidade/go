/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const ZoneSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1, 'At least one agency ID is required'),
	code: z.string().trim().min(1).max(10),
	geojson: z.object({
		geometry: z.object({
			coordinates: z.array(z.array(z.array(z.number()))).min(1),
			type: z.literal('Polygon'),
		}),
		properties: z.object({}).optional(),
		type: z.literal('Feature'),
	}),
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
