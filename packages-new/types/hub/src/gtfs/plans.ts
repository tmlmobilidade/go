/* * */

import { GtfsDateSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportPlansSchema = z.object({
	agency_id: z.string(),
	plan_end_date: GtfsDateSchema,
	plan_id: z.string(),
	plan_start_date: GtfsDateSchema,
});

/**
 * Representation of a GTFS plan for the Hub GTFS export.
 */
export type HubGtfsExportPlans = z.infer<typeof HubGtfsExportPlansSchema>;
