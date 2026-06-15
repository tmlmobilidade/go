/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { RouteSimplifiedSchema } from './route.js';
import { TransportTypeSchema } from './transport-type.js';

/* * */

export const INTERCHANGE_MODE = {
	CONFIGURED: '2', // Validation transfers should be configured in APEX configuration files
	NONE: '0', // Validation transfers are not allowed
	SAME_OPERATOR: '1', // Validation transfers are allowed only in the same operator
} as const;

export const interchangeModeOptions = [
	{ label: 'Transbordos não são permitidos', value: INTERCHANGE_MODE.NONE },
	{ label: 'Transbordos não são permitidos dentro do mesmo operador', value: INTERCHANGE_MODE.SAME_OPERATOR },
	{ label: 'Transbordos devem ser configurados nos ficheiros APEX', value: INTERCHANGE_MODE.CONFIGURED },
];

/* * */

export const LineSchema = DocumentSchema.extend({
	agency_id: z.string(),
	code: z.string().trim().min(1).max(10),
	interchange: z.nativeEnum(INTERCHANGE_MODE).default(INTERCHANGE_MODE.NONE),
	is_circular_line: z.boolean().default(false),
	is_locked: z.boolean().default(false),
	is_school_line: z.boolean().default(false),
	name: z.string().trim().min(1).max(150),
	onboard_fare_ids: z.array(z.string()).nullable().default([]),
	prepaid_fare_id: z.string().nullable().default(null),
	routes: z.array(RouteSimplifiedSchema).optional().default([]), // Computed field, not stored in DB
	transport_type: TransportTypeSchema.default('bus'),
	typology: z.string().nullable().default(null),
});

/* * */

export const CreateLineSchema = LineSchema.omit({ _id: true, created_at: true, routes: true, updated_at: true });

export const UpdateLineSchema = CreateLineSchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Line = z.infer<typeof LineSchema>;
export type CreateLineDto = z.infer<typeof CreateLineSchema>;
export type UpdateLineDto = z.infer<typeof UpdateLineSchema>;
