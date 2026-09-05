/* * */

import { GtfsRtCauseSchema, GtfsRtEffectSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { AlertReferenceSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiAlertSchema = z.object({
	_id: z.string(),
	active_period_end_date: UnixMillisecondsSchema.nullable().default(null),
	active_period_start_date: UnixMillisecondsSchema,
	agency_id: z.string(),
	cause: GtfsRtCauseSchema,
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	description: z.string(),
	effect: GtfsRtEffectSchema,
	image_url: z.string().nullable().default(null),
	info_url: z.union([z.string().url(), z.literal('')]).nullable().default(null),
	municipality_ids: z.array(z.string()).default([]),
	reference_type: AlertReferenceTypeSchema,
	references: z.array(AlertReferenceSchema).default([]),
	title: z.string(),
});

/**
 * Alert data for the Hub V1 Alerts API.
 */
export type HubV1ApiAlert = z.infer<typeof HubV1ApiAlertSchema>;

