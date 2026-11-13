/* * */

import { z } from 'zod';

/* * */

export const StopToCanvasExtSchema = z.object({
	canvas_profile: z.string(),
	direction_id: z.number(),
	stop_id: z.string(),
});

export type StopToCanvasExt = z.output<typeof StopToCanvasExtSchema>;
