/* * */

import { DocumentSchema } from '@/_common/document.js';
import { type GeoJSON } from 'geojson';
import { z } from 'zod';

/* * */

export const ZoneSchema = DocumentSchema.extend({
	border_color: z.string(),
	border_opacity: z.number(),
	border_width: z.number(),
	code: z.string(),
	created_at: z.coerce.date(),
	fill_color: z.string(),
	fill_opacity: z.number(),
	geojson: z.record(z.any()), // TODO: Validate GeoJSON
	is_locked: z.boolean(),
	name: z.string(),
});

export const CreateZoneSchema = ZoneSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateZoneSchema = CreateZoneSchema.omit({ created_by: true }).partial();

export type Zone = Omit<z.infer<typeof ZoneSchema>, 'geojson'> & { geojson: GeoJSON };
export type CreateZoneDto = Omit<z.infer<typeof CreateZoneSchema>, 'geojson'> & { geojson: GeoJSON };
export type UpdateZoneDto = Partial<CreateZoneDto>;
