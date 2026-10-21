/* * */

import { BaseDocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const YearPeriodSchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	code: z.string().optional(),
	color: z.string().optional(),
	dates: z.array(OperationalDateSchema).optional(),
	is_locked: z.boolean().default(false),
	name: z.string().min(1),
});

export const CreateYearPeriodSchema = YearPeriodSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateYearPeriodSchema = CreateYearPeriodSchema.partial();

/* * */

export type YearPeriod = z.infer<typeof YearPeriodSchema>;
export type CreateYearPeriodDto = z.infer<typeof CreateYearPeriodSchema>;
export type UpdateYearPeriodDto = z.infer<typeof UpdateYearPeriodSchema>;
