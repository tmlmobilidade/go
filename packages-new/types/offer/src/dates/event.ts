/* * */

import { EventRuleSchema } from '@/network/rules.js';
import { BaseDocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const EventSchema = BaseDocumentSchema.extend({
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
});

export const CreateEventSchema = EventSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateEventSchema = CreateEventSchema.partial();

/* * */

export type Event = z.infer<typeof EventSchema>;
export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
