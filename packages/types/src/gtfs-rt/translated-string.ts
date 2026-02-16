/* * */

import { GtfsRtTranslationSchema } from '@/gtfs-rt/translation.js';
import { z } from 'zod';

/* * */

export const GtfsRtTranslatedStringSchema = z.object({
	translation: z.array(GtfsRtTranslationSchema).min(1),
});

export type GtfsRtTranslatedString = z.infer<typeof GtfsRtTranslatedStringSchema>;
