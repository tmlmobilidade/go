/* * */

import { GtfsTripSchema } from '@/gtfs-new/trips.js';
import { z } from 'zod';

/* * */

export const GtfsTMLTripSchema = GtfsTripSchema.extend({
	pattern_short_name: z.string(),
	pattern_id: z.string(),
	calendar_desc: z.string(),
});

export type GtfsTMLTrip = z.infer<typeof GtfsTMLTripSchema>;
