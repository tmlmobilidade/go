/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1StopToCanvasExtSchema = z.object({
	canvas_profile: z.string(),
	direction_id: z.number(),
	stop_id: z.string(),
});

export type OperationPostersV1StopToCanvasExt = z.output<typeof OperationPostersV1StopToCanvasExtSchema>;
