/* * */

import { DocumentSchema } from '@/_common/document.js';
import { operationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const LinesModeSchema = z.enum(['none', 'all', 'include', 'exclude']);
export type LinesMode = z.infer<typeof LinesModeSchema>;

export const EventSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	dates: z.array(operationalDateSchema).default([]),
	description: z.string().default(''),
	end_time: z.string().default(''),
	is_locked: z.boolean().default(false),
	lines_mode: LinesModeSchema.default('none'),
	lines_to_exclude: z.array(z.string()).default([]),
	lines_to_include: z.array(z.string()).default([]),
	start_time: z.string().default(''),
	title: z.string().default(''),
});

export const CreateEventSchema = EventSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateEventSchema = CreateEventSchema.omit({ created_by: true }).partial();

/* * */

export type Event = z.infer<typeof EventSchema>;
export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
