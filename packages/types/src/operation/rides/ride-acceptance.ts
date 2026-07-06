/* * */

import { AlertCauseSchema } from '@/alerts/cause.js';
import { RideAnalysisSummarySchema } from '@/operation/rides/ride-analysis.js';
import { CommentSchema, DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RIDE_ACCEPTANCE_STATUS_OPTIONS = ['justification_required', 'under_review', 'accepted', 'rejected'] as const;
export const RideAcceptanceStatusSchema = z.enum(RIDE_ACCEPTANCE_STATUS_OPTIONS);
export type RideAcceptanceStatus = z.infer<typeof RideAcceptanceStatusSchema>;

export const RIDE_JUSTIFICATION_SOURCE_OPTIONS = ['MANUAL', 'ALERT'] as const;
export const RideJustificationSourceSchema = z.enum(RIDE_JUSTIFICATION_SOURCE_OPTIONS);
export type RideJustificationSource = z.infer<typeof RideJustificationSourceSchema>;

export const RIDE_JUSTIFICATION_STATUS_TYPE_OPTIONS = ['locked_status', 'acceptance_status', 'pto_message'] as const;
export const RideJustificationStatusTypeSchema = z.enum(RIDE_JUSTIFICATION_STATUS_TYPE_OPTIONS);
export type RideJustificationStatusType = z.infer<typeof RideJustificationStatusTypeSchema>;

/* * */

export const RideJustificationSchema = DocumentSchema
	.omit({ _id: true, is_locked: true })
	.extend({
		justification_cause: AlertCauseSchema,
		justification_source: RideJustificationSourceSchema,
		manual_trip_id: z.string().optional(),
		pto_message: z.string().min(2).max(5000).default(''),
	});

export type RideJustification = z.infer<typeof RideJustificationSchema>;

/* * */

export const RideAcceptanceSchema = DocumentSchema.extend({
	acceptance_status: RideAcceptanceStatusSchema,
	analysis_summary: RideAnalysisSummarySchema,
	comments: z.array(CommentSchema).default([]),
	is_locked: z.boolean().default(false),
	justification: RideJustificationSchema.nullable(),
	ride_id: z.string(),
});

export const CreateRideAcceptanceSchema = RideAcceptanceSchema.partial({ _id: true }).omit({ created_at: true, updated_at: true });
export const UpdateRideAcceptanceSchema = RideAcceptanceSchema.omit({ created_at: true, created_by: true }).partial();

export type RideAcceptance = z.infer<typeof RideAcceptanceSchema>;
export type CreateRideAcceptanceDto = z.infer<typeof CreateRideAcceptanceSchema>;
export type UpdateRideAcceptanceDto = z.infer<typeof UpdateRideAcceptanceSchema>;
