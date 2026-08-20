import { z } from 'zod';

/* * */

export const MetricBaseSchema = z.object({
	description: z.string().optional(),
	generated_at: z.date(),
	metric: z.string(),
});
