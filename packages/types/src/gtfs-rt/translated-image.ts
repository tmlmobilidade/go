/* * */

import { GtfsRtLocalizedImageSchema } from '@/gtfs-rt/localized-image.js';
import { z } from 'zod';

/* * */

export const GtfsRtTranslatedImageSchema = z.object({
	localized_image: z.array(GtfsRtLocalizedImageSchema).min(1),
});

export type GtfsRtTranslatedImage = z.infer<typeof GtfsRtTranslatedImageSchema>;
