/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1RoutesToCanvasExtSchema = z.object({
	canvas_profile: z.string(),
	direction_id: z.number(),
	route_id: z.string(),
});

export type OperationPostersV1RoutesToCanvasExt = z.output<typeof OperationPostersV1RoutesToCanvasExtSchema>;
