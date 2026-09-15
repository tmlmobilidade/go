/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ExtractionPropertiesSchema = z.object({

	agency_ids: z
		.array(z.string()),

	canvas_profile: z.string(),

	content_mode: z.enum(['all', 'lines', 'stops', 'lines_stops']),

	line_ids: z.array(z.string()).optional(),

	lines_mode: z.enum(['include', 'exclude']).optional(),

	plan_ids: z
		.array(z.string()),

	stop_ids: z.array(z.string()).optional(),

	stops_mode: z.enum(['include', 'exclude']).optional(),

});

export type OperationPostersV1ExtractionProperties = z.infer<typeof OperationPostersV1ExtractionPropertiesSchema>;
