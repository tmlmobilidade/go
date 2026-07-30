/* * */

import { GtfsValidationSummarySchema } from '@/clean/summary.js';
import { GtfsAgencySchema, GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { DocumentSchema, ProcessingStatusSchema, ValidityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsValidationSchema = DocumentSchema.extend({
	agency_id: z.string(),
	file_id: z.string(),
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	notification_sent: z.boolean().default(false),
	processing_status: ProcessingStatusSchema.default('waiting'),
	summary: GtfsValidationSummarySchema.nullish(),
	validation_attempts: z.number().default(0),
	validity_status: ValidityStatusSchema.default('unknown'),
});

export const CreateGtfsValidationSchema = GtfsValidationSchema.omit({ _id: true, updated_at: true });
export const UpdateGtfsValidationSchema = CreateGtfsValidationSchema.omit({ created_at: true, created_by: true }).partial();

export type GtfsValidation = z.infer<typeof GtfsValidationSchema>;
export type CreateGtfsValidationDto = z.infer<typeof CreateGtfsValidationSchema>;
export type UpdateGtfsValidationDto = z.infer<typeof UpdateGtfsValidationSchema>;
