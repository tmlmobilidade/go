/* * */

import { EventRuleSchema } from '@/network/rules.js';
import { BaseDocumentSchema, OperationalDateIntSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { validationMessage } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

/* * */

export const EventSchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1),
	code: z.string()
		.min(1)
		.max(10)
		.regex(/^[A-Z0-9_]+$/, { error: validationMessage('custom.dates.event_id') }),
	dates: z.array(OperationalDateIntSchema).default([]),
	description: z.string().default(''),
	is_locked: z.boolean().default(false),
	rules: z.array(EventRuleSchema).default([]),
	title: z.string().min(1),
});

export const CreateEventSchema = EventSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateEventSchema = partialWithoutDefaults(CreateEventSchema);

/* * */

export type Event = z.infer<typeof EventSchema>;
export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
