/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1GtfsPlansSchema = z.object({
	agency_id: z.string(),
	plan_end_date: OperationalDateIntSchema,
	plan_id: z.string(),
	plan_start_date: OperationalDateIntSchema,
});

/**
 * Representation of a GTFS plan for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsPlansInput = z.input<typeof HubV1GtfsPlansSchema>;

/**
 * Representation of a GTFS plan for the Hub V1 GTFS.
 */
export type HubV1GtfsPlans = z.output<typeof HubV1GtfsPlansSchema>;
