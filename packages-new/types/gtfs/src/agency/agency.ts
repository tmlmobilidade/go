/* * */

import { z } from 'zod';

/* * */

export const GtfsAgencySchema = z.object({
	agency_email: z.string().nullish(),
	agency_fare_url: z.string().nullish(),
	agency_id: z.string(),
	agency_lang: z.string().nullish(),
	agency_name: z.string(),
	agency_phone: z.string().nullish(),
	agency_timezone: z.string(),
	agency_url: z.string().nullish(),
});

export type GtfsAgency = z.infer<typeof GtfsAgencySchema>;
