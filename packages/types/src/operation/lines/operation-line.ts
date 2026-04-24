/* * */

import { z } from 'zod';

/* * */

export const OperationLineSchema = z.object({
	agency_id: z.string(),
	line_id: z.number(),
	line_long_name: z.string(),
	line_short_name: z.string(),
	route_color: z.string(),
});

export type OperationLine = z.infer<typeof OperationLineSchema>;
