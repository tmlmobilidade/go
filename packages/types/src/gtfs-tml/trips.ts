/* * */

import { GtfsTripSchema } from '@/gtfs-new/trips.js';
import { z } from 'zod';

/* * */

export const GtfsTMLTripSchema = GtfsTripSchema.extend({
	calendar_desc: z.string(),
	pattern_id: z.string(),
	pattern_short_name: z.string(),
});

export type GtfsTMLTrip = z.infer<typeof GtfsTMLTripSchema>;
