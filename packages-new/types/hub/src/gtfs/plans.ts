/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubGtfsExportPlansSchema = z.object({
	agency_id: z.string(),
	plan_end_date: OperationalDateIntSchema,
	plan_id: z.string(),
	plan_start_date: OperationalDateIntSchema,
});

/**
 * Representation of a GTFS plan for the Hub GTFS export that is being created.
 */
export type HubGtfsExportPlansInput = z.input<typeof HubGtfsExportPlansSchema>;

/**
 * Representation of a GTFS plan for the Hub GTFS export.
 */
export type HubGtfsExportPlans = z.output<typeof HubGtfsExportPlansSchema>;
