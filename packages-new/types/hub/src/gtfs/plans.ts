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
 * Representation of a GTFS plan for the Hub GTFS export that is being created.
 */
export type HubGtfsExportPlansInput = z.input<typeof HubGtfsExportPlansSchema>;

/**
 * Representation of a GTFS plan for the Hub GTFS export.
 */
export type HubGtfsExportPlans = z.output<typeof HubGtfsExportPlansSchema>;
