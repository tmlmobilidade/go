/* * */

import { GtfsAgencySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV1AgencySchema = GtfsAgencySchema.extend({
	agency_code: z.string(),
	agency_email: z.string(),
	agency_fare_url: z.string(),
	agency_id: z.string(),
	agency_lang: z.string(),
	agency_name: z.string(),
	agency_phone: z.string(),
	agency_timezone: z.string(),
	agency_url: z.string(),
});

/**
 * Represents an agency in the custom GTFS strict v1 format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and add the `agency_code` field to be able to accomodate multiple agencies
 * with the same code, that necessarily must have different `agency_id` values.
 */
export type GtfsStrictV1Agency = z.infer<typeof GtfsStrictV1AgencySchema>;
