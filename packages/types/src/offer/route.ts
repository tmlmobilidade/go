/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const PATH_TYPE = {
	BASE: '0',
	PARCEL: '1',
	VARIANT: '2',
} as const;

export const pathTypeOptions = [
	{ label: 'Rota Base (Principal)', value: PATH_TYPE.BASE },
	{ label: 'Parcelar', value: PATH_TYPE.PARCEL },
	{ label: 'Variante', value: PATH_TYPE.VARIANT },
];

/* * */

export const RouteSchema = DocumentSchema.extend({
	code: z.string().trim().min(1).max(10),
	line_id: z.string(),
	name: z.string().trim().min(1).max(50),
	path_type: z.nativeEnum(PATH_TYPE).default(PATH_TYPE.BASE),
	patterns: z.array(z.string()).optional(),
});

export const RouteSimplifiedSchema = z.object({
	_id: z.string(),
	code: z.string().trim().min(1).max(10),
	name: z.string().trim().min(1).max(50),
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
