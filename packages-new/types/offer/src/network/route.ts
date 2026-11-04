/* * */

import { BaseDocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { RoutePathType, RoutePathTypeSchema } from './route-path-type.js';

/* * */

export const pathTypeOptions: { label: string, value: RoutePathType }[] = [
	{ label: 'Rota Base (Principal)', value: 'base' },
	{ label: 'Parcelar', value: 'partial' },
	{ label: 'Variante', value: 'variant' },
];

/* * */

export const RouteSchema = BaseDocumentSchema.extend({
	code: z.string().trim().min(1).max(10),
	line_id: z.string().min(1),
	name: z.string().trim().min(1),
	path_type: RoutePathTypeSchema.default('base'),
});

export const RouteSimplifiedSchema = z.object({
	_id: z.string(),
	code: z.string().trim().min(1).max(10),
	name: z.string().trim().min(1),
});

/* * */

export const CreateRouteSchema = RouteSchema.omit({ _id: true, created_at: true, created_by: true, is_locked: true, updated_at: true, updated_by: true });

export const UpdateRouteSchema = CreateRouteSchema.partial();

/* * */

export type Route = z.infer<typeof RouteSchema>;
export type CreateRouteDto = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteDto = z.infer<typeof UpdateRouteSchema>;

export type RouteSimplified = z.infer<typeof RouteSimplifiedSchema>;
