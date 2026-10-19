/* * */

import { EventSchema, PatternSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const EventsDetailSchema = EventSchema.extend({
	associated_patterns: z.array(PatternSchema.pick({
		_id: true,
		code: true,
		headsign: true,
		line_id: true,
		route_id: true,
	})).default([]),
});

export type EventsDetail = z.infer<typeof EventsDetailSchema>;
