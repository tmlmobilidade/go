/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV30AgencySchema = z.object({
	agency_code: z.string().optional(),
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
 * Represents an agency in the custom GTFS strict v30 format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and add the `agency_code` field to be able to accomodate multiple agencies
 * with the same code, that necessarily must have different `agency_id` values.
 */
export type GtfsStrictV30Agency = z.infer<typeof GtfsStrictV30AgencySchema>;
