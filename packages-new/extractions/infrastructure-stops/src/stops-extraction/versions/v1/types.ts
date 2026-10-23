/* * */

import { z } from 'zod';

/* * */

export const InfrastructureStopsV1OutputRowSchema = z.object({
	flags: z.string(),
	legacy_ids: z.string(),
	stop_code: z.string(),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
});

export type InfrastructureStopsV1OutputRow = z.infer<typeof InfrastructureStopsV1OutputRowSchema>;
