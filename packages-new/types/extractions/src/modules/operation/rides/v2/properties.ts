/* * */

import { DelayStatusFilterSchema, GradeStatusFilterSchema, OperationalStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/**
 * The properties of a v2 Rides extraction.
 * They mirror the filters of the Rides list, so that whatever is visible
 * on screen can be extracted with the exact same criteria.
 */
export const OperationRidesV2ExtractionPropertiesSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	analysis_at_least_one_vehicle_event_on_last_stop_grades: z
		.array(GradeStatusFilterSchema)
		.optional(),

	analysis_expected_apex_validation_interval_grades: z
		.array(GradeStatusFilterSchema)
		.optional(),

	analysis_simple_three_vehicle_events_grades: z
		.array(GradeStatusFilterSchema)
		.optional(),

	analysis_transaction_sequentiality_grades: z
		.array(GradeStatusFilterSchema)
		.optional(),

	driver_ids: z
		.array(z.string())
		.optional(),

	end_delay_statuses: z
		.array(DelayStatusFilterSchema)
		.optional(),

	operational_statuses: z
		.array(OperationalStatusSchema)
		.optional(),

	search: z
		.string()
		.optional(),

	start_delay_statuses: z
		.array(DelayStatusFilterSchema)
		.optional(),

	start_time_scheduled_end: UnixMillisecondsSchema,

	start_time_scheduled_start: UnixMillisecondsSchema,

	vehicle_ids: z
		.array(z.string())
		.optional(),

});

export type OperationRidesV2ExtractionProperties = z.infer<typeof OperationRidesV2ExtractionPropertiesSchema>;
