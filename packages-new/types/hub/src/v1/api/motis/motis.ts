/* * */

import { type MotisGeocodeResponse, MotisGeocodeResponseSchema, MotisLocationTypeSchema, MotisModeSchema, type MotisPlanResponse, MotisPlanResponseSchema } from '@tmlmobilidade/go-types-motis';
import { z } from 'zod';

/* * */

const HubV1ApiMotisBooleanQuerySchema = z.enum(['false', 'true']).transform(value => value === 'true');

/* * */

export const HubV1ApiMotisGeocodeQuerySchema = z.object({
	numResults: z.coerce.number().int().min(1).max(10).optional(),
	place: z.string().max(100).optional(),
	placeBias: z.coerce.number().min(0).max(1_000).optional(),
	text: z.string().trim().min(2).max(256),
	type: MotisLocationTypeSchema.optional(),
}).strict();

export const HubV1ApiMotisGeocodeResponseSchema: z.ZodType<MotisGeocodeResponse> = MotisGeocodeResponseSchema;

export const HubV1ApiMotisPlanQuerySchema = z.object({
	arriveBy: HubV1ApiMotisBooleanQuerySchema.optional(),
	detailedLegs: HubV1ApiMotisBooleanQuerySchema.optional(),
	directModes: MotisModeSchema.optional(),
	fromPlace: z.string().trim().min(1).max(256),
	maxItineraries: z.coerce.number().int().min(1).max(10).optional(),
	postTransitModes: MotisModeSchema.optional(),
	preTransitModes: MotisModeSchema.optional(),
	time: z.string().datetime({ offset: true }),
	toPlace: z.string().trim().min(1).max(256),
	transitModes: MotisModeSchema.optional(),
}).strict();

export const HubV1ApiMotisPlanResponseSchema: z.ZodType<MotisPlanResponse> = MotisPlanResponseSchema;

/* * */

export type HubV1ApiMotisGeocodeQuery = z.output<typeof HubV1ApiMotisGeocodeQuerySchema>;
export type HubV1ApiMotisGeocodeResponse = MotisGeocodeResponse;
export type HubV1ApiMotisPlanQuery = z.output<typeof HubV1ApiMotisPlanQuerySchema>;
export type HubV1ApiMotisPlanResponse = MotisPlanResponse;
