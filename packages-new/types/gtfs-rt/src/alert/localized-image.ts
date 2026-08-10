/* * */

import { z } from 'zod';

/* * */

export const GtfsRtLocalizedImageSchema = z.object({
	language: z.string(),
	media_type: z.string(),
	url: z.string(),
});

export type GtfsRtLocalizedImage = z.infer<typeof GtfsRtLocalizedImageSchema>;
