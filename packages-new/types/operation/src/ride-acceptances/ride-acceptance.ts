/* * */

import { RideAcceptanceStatusSchema } from '@/ride-acceptances/acceptance-status.js';
import { RideJustificationSchema } from '@/ride-acceptances/ride-justification.js';
import { RideOverridesSchema } from '@/ride-acceptances/ride-overrides.js';
import { BaseDocumentSchema, CommentSchema, GradeStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAcceptanceSchema = BaseDocumentSchema.extend({
	acceptance_status: RideAcceptanceStatusSchema,
	analysis_summary: z.record(z.string(), z.object({
		grade: GradeStatusSchema,
		reason: z.string().nullable(),
	})),
	comments: z.array(CommentSchema).default([]),
	justification: RideJustificationSchema.nullable(),
	overrides: RideOverridesSchema.nullable().default(null),
});

export const CreateRideAcceptanceSchema = RideAcceptanceSchema.partial({ _id: true }).omit({ created_at: true, updated_at: true });
export const UpdateRideAcceptanceSchema = RideAcceptanceSchema.omit({ created_at: true, created_by: true }).partial();

export type RideAcceptance = z.infer<typeof RideAcceptanceSchema>;
export type CreateRideAcceptanceDto = z.infer<typeof CreateRideAcceptanceSchema>;
export type UpdateRideAcceptanceDto = z.infer<typeof UpdateRideAcceptanceSchema>;
