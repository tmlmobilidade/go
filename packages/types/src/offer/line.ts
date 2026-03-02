/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

import { RouteSimplifiedSchema } from './route.js';

/* * */

export const TRANSPORT_TYPE = {
	AERIAL_LIFT: '6', // Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
	BUS: '3', // Bus. Used for short- and long-distance bus routes.
	CABLE_TRAM: '5', // Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
	FERRY: '4', // Ferry. Used for short- and long-distance boat service.
	FUNICULAR: '7', // Funicular. Any rail system designed for steep inclines.
	MONORAIL: '12', // Monorail. Railway in which the track consists of a single rail or a beam.
	RAIL: '2', // Rail. Used for intercity or long-distance travel.
	SUBWAY: '1', // Subway, Metro. Any underground rail system within a metropolitan area
	TRAM: '0', // Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area
	TROLLEYBUS: '11', // Trolleybus. Electric buses that draw power from overhead wires using poles.
} as const;

export const transportTypeOptions = [
	{ label: 'Teleférico', value: TRANSPORT_TYPE.AERIAL_LIFT },
	{ label: 'Autocarro', value: TRANSPORT_TYPE.BUS },
	{ label: 'Elétrico', value: TRANSPORT_TYPE.CABLE_TRAM },
	{ label: 'Ferry', value: TRANSPORT_TYPE.FERRY },
	{ label: 'Funicular', value: TRANSPORT_TYPE.FUNICULAR },
	{ label: 'Monocarril', value: TRANSPORT_TYPE.MONORAIL },
	{ label: 'Comboio', value: TRANSPORT_TYPE.RAIL },
	{ label: 'Metro', value: TRANSPORT_TYPE.SUBWAY },
	{ label: 'Elétrico', value: TRANSPORT_TYPE.TRAM },
	{ label: 'Trolleybus', value: TRANSPORT_TYPE.TROLLEYBUS },
]; // Move this to translations

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
	transport_type: z.nativeEnum(TRANSPORT_TYPE).default(TRANSPORT_TYPE.BUS),
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
