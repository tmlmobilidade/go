/* * */

import { LanguageTagSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppAgencySchema = z.object({
	agency_email: z.string().optional(),
	agency_fare_url: z.string().optional(),
	agency_id: z.string(),
	agency_lang: LanguageTagSchema.optional().default('pt'),
	agency_name: z.string(),
	agency_phone: z.string().optional(),
	agency_timezone: TimezoneIdentifiedSchema.optional().default('Europe/Lisbon'),
	agency_url: z.string().url().optional(),
});

/**
 * Represents an agency in the custom GTFS strict v30 STEPP format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and add the `agency_code` field to be able to accomodate multiple agencies
 * with the same code, that necessarily must have different `agency_id` values.
 */
export type GtfsStrictV30SteppAgency = z.infer<typeof GtfsStrictV30SteppAgencySchema>;
