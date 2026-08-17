/* * */

import { z } from 'zod';

/* * */

export const AlertsLinesListItemSchema = z.object({
	agency_id: z.string(),
	route_ids: z.array(z.string()),
	route_long_name: z.string(),
	route_short_name: z.string(),
});

/**
 * A read model combining the canonical lines data with derived data, including routes.
 * It is intended for use in the alerts module.
 */
export type AlertsLinesListItem = z.infer<typeof AlertsLinesListItemSchema>;
