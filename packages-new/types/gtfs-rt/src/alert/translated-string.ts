/* * */

import { z } from 'zod';

import { GtfsRtTranslationSchema } from './translation.js';

/* * */

export const GtfsRtTranslatedStringSchema = z.object({
	translation: z.array(GtfsRtTranslationSchema).min(1),
});

export type GtfsRtTranslatedString = z.infer<typeof GtfsRtTranslatedStringSchema>;
