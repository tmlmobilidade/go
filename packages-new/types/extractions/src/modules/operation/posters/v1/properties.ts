/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ExtractionPropertiesSchema = z.object({

	agency_ids: z.array(z.string()),

	canvas_profile: z.enum(['auto', '0Master.A', '0Master.B', '0Master.C', '0Master.F']),

	content_mode: z.enum(['all', 'lines', 'stops']),

	download_url: z.string().optional().nullable(),

	line_ids: z.array(z.string()).optional(),

	lines_mode: z.enum(['include', 'exclude']).optional(),

	plan_ids: z.array(z.string()),

	stop_ids: z.array(z.string()).optional(),

	stops_mode: z.enum(['include', 'exclude']).optional(),

});

export type OperationPostersV1ExtractionProperties = z.infer<typeof OperationPostersV1ExtractionPropertiesSchema>;
