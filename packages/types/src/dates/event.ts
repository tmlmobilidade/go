/* * */

import { EventRuleSchema } from '@/offer/rules.js';
import { DocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const EventSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1),
	code: z.string()
		.min(1)
		.max(10)
		.regex(/^[A-Z0-9_]+$/, 'Must be uppercase letters, numbers, or underscores'),
	dates: z.array(OperationalDateSchema).default([]),
	description: z.string().default(''),
	is_locked: z.boolean().default(false),
	rules: z.array(EventRuleSchema).default([]),
	title: z.string().min(1),

	// This field is not sent by the backend, but is useful to have in the frontend for easier access to the associated patterns of an event
	associated_patterns: z.array(z.object({
		_id: z.string(),
		code: z.string(),
		headsign: z.string(),
		line_id: z.string(),
		route_id: z.string(),
	})).default([]),
});

export const CreateEventSchema = EventSchema.omit({ _id: true, associated_patterns: true, created_at: true, updated_at: true });
export const UpdateEventSchema = CreateEventSchema.omit({ created_by: true }).partial();

/* * */

export type Event = z.infer<typeof EventSchema>;
export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
