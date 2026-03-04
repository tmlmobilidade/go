/* * */

import { DocumentSchema } from '@/_common/document.js';
import { ProcessingStatusSchema, ValidityStatusSchema } from '@/_common/status.js';
import { GtfsValidationSummarySchema } from '@/gtfs-validation/gtfs-validation-summary.js';
import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { z } from 'zod';

/* * */

export const GtfsValidationSchema = DocumentSchema.extend({
	file_id: z.string(),
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	notification_sent: z.boolean().default(false),
	processing_status: ProcessingStatusSchema.default('waiting'),
	summary: GtfsValidationSummarySchema.nullish(),
	validation_attempts: z.number().default(0),
	validity_status: ValidityStatusSchema.default('unknown'),
});

export const CreateGtfsValidationSchema = GtfsValidationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateGtfsValidationSchema = CreateGtfsValidationSchema.omit({ created_by: true }).partial();

export type GtfsValidation = z.infer<typeof GtfsValidationSchema>;
export type CreateGtfsValidationDto = z.infer<typeof CreateGtfsValidationSchema>;
export type UpdateGtfsValidationDto = z.infer<typeof UpdateGtfsValidationSchema>;
