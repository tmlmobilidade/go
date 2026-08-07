/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PatternSimplifiedSchema } from './pattern.js';
import { RoutePathType, RoutePathTypeSchema } from './route-path-type.js';

/* * */

export const pathTypeOptions: { label: string, value: RoutePathType }[] = [
	{ label: 'Rota Base (Principal)', value: 'base' },
	{ label: 'Parcelar', value: 'partial' },
	{ label: 'Variante', value: 'variant' },
];

/* * */

export const RouteSchema = DocumentSchema.extend({
	code: z.string().trim().min(1).max(10),
	line_id: z.string(),
	name: z.string().trim().min(1),
	path_type: RoutePathTypeSchema.default('base'),
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
