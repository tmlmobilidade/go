/* * */

import { z } from 'zod';

import { GtfsRtLocalizedImageSchema } from './localized-image.js';

/* * */

export const GtfsRtTranslatedImageSchema = z.object({
	localized_image: z.array(GtfsRtLocalizedImageSchema).min(1),
});

export type GtfsRtTranslatedImage = z.infer<typeof GtfsRtTranslatedImageSchema>;
