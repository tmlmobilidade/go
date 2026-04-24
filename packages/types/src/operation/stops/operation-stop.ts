/* * */

import { z } from 'zod';

/* * */

export const OperationStopSchema = z.object({
	line_ids: z.array(z.string()),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
});

export type OperationStop = z.infer<typeof OperationStopSchema>;
