/* * */

import { DocumentSchema } from '@/_common/document.js';
import { GtfsPathType, GtfsPathTypeSchema } from '@/gtfs-new/path-type.js';
import { z } from 'zod';

import { PatternSimplifiedSchema } from './pattern.js';

/* * */

export const pathTypeOptions: { label: string, value: GtfsPathType }[] = [
	{ label: 'Rota Base (Principal)', value: 1 },
	{ label: 'Parcelar', value: 2 },
	{ label: 'Variante', value: 3 },
];

/* * */

export const RouteSchema = DocumentSchema.extend({
	code: z.string().trim().min(1).max(10),
	line_id: z.string(),
	name: z.string().trim().min(1),
	path_type: GtfsPathTypeSchema,
	patterns: z.array(PatternSimplifiedSchema).optional(),
});

export const RouteSimplifiedSchema = z.object({
	_id: z.string(),
	code: z.string().trim().min(1).max(10),
	name: z.string().trim().min(1),
});

/* * */

export const CreateRouteSchema = RouteSchema.omit({ _id: true, created_at: true, patterns: true, updated_at: true });

export const UpdateRouteSchema = CreateRouteSchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Route = z.infer<typeof RouteSchema>;
export type CreateRouteDto = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteDto = z.infer<typeof UpdateRouteSchema>;

export type RouteSimplified = z.infer<typeof RouteSimplifiedSchema>;
