/* * */

import { z } from 'zod';

/* * */

export const ShapesExtSchema = z.object({
	direction_description: z.string(),
	note: z.string(),
	priority_number: z.number(),
	sequence_number: z.number(),
	shape_id: z.string(),
	via_text: z.string(),
});

export type ShapesExt = z.output<typeof ShapesExtSchema>;
