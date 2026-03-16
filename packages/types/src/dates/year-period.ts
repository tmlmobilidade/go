/* * */

import { DocumentSchema } from '@/_common/document.js';
import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const YearPeriodSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	color: z.string().optional(),
	dates: z.array(OperationalDateSchema).optional(),
	is_locked: z.boolean().default(false),
	name: z.string().min(1),
});

export const CreateYearPeriodSchema = YearPeriodSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateYearPeriodSchema = CreateYearPeriodSchema.omit({ created_by: true }).partial();

/* * */

export type YearPeriod = z.infer<typeof YearPeriodSchema>;
export type CreateYearPeriodDto = z.infer<typeof CreateYearPeriodSchema>;
export type UpdateYearPeriodDto = z.infer<typeof UpdateYearPeriodSchema>;
