/* * */

import { z } from 'zod';

/* * */

export const GtfsAgencySchema = z.object({
	agency_email: z.string().optional(),
	agency_fare_url: z.string().optional(),
	agency_id: z.string(),
	agency_lang: z.string().optional(),
	agency_name: z.string(),
	agency_phone: z.string().optional(),
	agency_timezone: z.string(),
	agency_url: z.string().optional(),
});

/**
 * Represents an agency in the GTFS format.
 * An agency is a group of transit services that are operated by a single entity.
 * It includes information such as the agency ID, name, phone, email, and URL.
 */
export type GtfsAgency = z.infer<typeof GtfsAgencySchema>;
