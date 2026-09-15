/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1AgencySchema = z.object({
	agency_code: z.string(),
	agency_email: z.string().optional(),
	agency_fare_url: z.string().optional(),
	agency_id: z.string(),
	agency_lang: z.string().optional(),
	agency_name: z.string(),
	agency_phone: z.string().optional(),
	agency_timezone: z.string(),
	agency_url: z.string().optional(),
});

export type OperationPostersV1Agency = z.output<typeof OperationPostersV1AgencySchema>;
