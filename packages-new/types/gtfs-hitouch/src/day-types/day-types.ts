/* * */

import { z } from 'zod';

/* * */

export const DayTypesExtSchema = z.object({
	day_type_id: z.string(),
	friday: z.string(),
	monday: z.string(),
	name: z.string(),
	saturday: z.string(),
	sequence_number: z.number(),
	sunday: z.string(),
	thursday: z.string(),
	tuesday: z.string(),
	wednesday: z.string(),
});

export type DayTypesExt = z.output<typeof DayTypesExtSchema>;
