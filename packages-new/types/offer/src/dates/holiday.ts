/* * */

import { DocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HolidaySchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	dates: z.array(OperationalDateSchema).default([]),
	description: z.string().optional(),
	is_locked: z.boolean().default(false),
	title: z.string().min(1),
});

export const CreateHolidaySchema = HolidaySchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateHolidaySchema = CreateHolidaySchema.omit({ created_by: true }).partial();

/* * */

export type Holiday = z.infer<typeof HolidaySchema>;
export type CreateHolidayDto = z.infer<typeof CreateHolidaySchema>;
export type UpdateHolidayDto = z.infer<typeof UpdateHolidaySchema>;
