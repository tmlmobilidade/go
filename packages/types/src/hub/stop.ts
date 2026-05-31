/* * */

import { StopSchema } from '@/stops/stop.js';
import { z } from 'zod';

/* * */

export const HubStopSchema = StopSchema.pick({
	_id: true,
	district_id: true,
	flags: true,
	latitude: true,
	legacy_ids: true,
	lifecycle_status: true,
	locality_id: true,
	longitude: true,
	municipality_id: true,
	name: true,
	short_name: true,
	tts_name: true,
}).extend({

});

/**
 * Publishable stop data for the Hub Stops API.
 */
export type HubStop = z.infer<typeof HubStopSchema>;

