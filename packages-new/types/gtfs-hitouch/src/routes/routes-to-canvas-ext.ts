/* * */

import { z } from 'zod';

/* * */

export const RoutesToCanvasExtSchema = z.object({
	canvas_profile: z.string(),
	direction_id: z.number(),
	route_id: z.string(),
});

export type RoutesToCanvasExt = z.output<typeof RoutesToCanvasExtSchema>;
