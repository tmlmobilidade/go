/* * */

import { z } from 'zod';

/* * */

export const AgencyOpenDataSchema = z.object({
	contacts: z.object({
		email: z.string().email(),
		fare_url: z.string().url(),
		name: z.string(),
		phone: z.string(),
		website_url: z.string().url(),
	}),
	services: z.object({
		eta_enabled: z.boolean().default(false),
		gtfs_enabled: z.boolean().default(false),
		positions_enabled: z.boolean().default(false),
		service_alerts_enabled: z.boolean().default(false),
	}),
});

/* * */

export type AgencyOpenData = z.infer<typeof AgencyOpenDataSchema>;
