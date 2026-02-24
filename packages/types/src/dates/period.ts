/* * */

import { DocumentSchema } from '@/_common/document.js';
import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const PeriodSchema = DocumentSchema.extend({
	agency_id: z.string().optional(),
	color: z.string().optional(),
	dates: z.array(OperationalDateSchema).optional(),
	is_locked: z.boolean().default(false),
	name: z.string().min(1),
});

export const CreatePeriodSchema = PeriodSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdatePeriodSchema = CreatePeriodSchema.omit({ created_by: true }).partial();

/* * */

export type Period = z.infer<typeof PeriodSchema>;
export type CreatePeriodDto = z.infer<typeof CreatePeriodSchema>;
export type UpdatePeriodDto = z.infer<typeof UpdatePeriodSchema>;
