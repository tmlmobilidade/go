/* * */

import { GtfsTripExtendedSchema } from '@/gtfs-new/trips.js';
import { z } from 'zod';

/* * */

export const GtfsTMLTripSchema = GtfsTripExtendedSchema.extend({
	pattern_short_name: z.string(),
});

export type GtfsTMLTrip = z.infer<typeof GtfsTMLTripSchema>;
