/* * */

import { z } from 'zod';

/* * */

export const AgencyOpenDataSchema = z.object({
	eta_enabled: z.boolean().default(false),
	gtfs_enabled: z.boolean().default(false),
	positions_enabled: z.boolean().default(false),
	service_alerts_enabled: z.boolean().default(false),
});

/* * */

export type AgencyOpenData = z.infer<typeof AgencyOpenDataSchema>;
