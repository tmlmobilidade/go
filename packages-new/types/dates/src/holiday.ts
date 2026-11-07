/* * */

import { BaseDocumentSchema, OperationalDateIntSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HolidaySchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1),
	dates: z.array(OperationalDateIntSchema).default([]),
	description: z.string().optional(),
	is_locked: z.boolean().default(false),
	title: z.string().min(1),
});

export const CreateHolidaySchema = HolidaySchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateHolidaySchema = partialWithoutDefaults(CreateHolidaySchema);

/* * */

export type Holiday = z.infer<typeof HolidaySchema>;
export type CreateHolidayDto = z.infer<typeof CreateHolidaySchema>;
export type UpdateHolidayDto = z.infer<typeof UpdateHolidaySchema>;
