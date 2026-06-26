/* * */

import { z } from 'zod';

/* * */

export const GtfsRtTranslationSchema = z.object({
	language: z.string(),
	text: z.string(),
});

export type GtfsRtTranslation = z.infer<typeof GtfsRtTranslationSchema>;
