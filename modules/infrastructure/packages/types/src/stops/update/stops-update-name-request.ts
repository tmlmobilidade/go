/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsUpdateNameRequestSchema = StopSchema.pick({
	name: true,
	short_name: true,
	tts_name: true,
});

export type StopsUpdateNameRequest = z.infer<typeof StopsUpdateNameRequestSchema>;
