/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const EventsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * Agency fields returned by the Events lookup in the Offer module.
 */
export type EventsAgencyItem = z.infer<typeof EventsAgencyItemSchema>;
