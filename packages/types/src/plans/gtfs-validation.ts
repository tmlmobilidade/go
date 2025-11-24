/* * */

import { DocumentSchema } from '@/_common/document.js';
import { ProcessingStatusSchema } from '@/_common/status.js';
import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { z } from 'zod';

/* * */

/* SUMMARY */

export const SEVERITY_LEVELS = ['error', 'warning', 'ignore', 'forbidden'] as const;
export const SeverityLevelSchema = z.enum(SEVERITY_LEVELS);
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

export const GTFSValidatorMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	rows: z.array(z.number()),
	severity: SeverityLevelSchema,
	validation_id: z.string(),
});

export const GTFSValidatorSummarySchema = z.object({
	messages: z.array(GTFSValidatorMessageSchema),
	total_errors: z.number(),
	total_warnings: z.number(),
});

export type GTFSValidatorSummary = z.infer<typeof GTFSValidatorSummarySchema>;
export type GTFSValidatorMessage = z.infer<typeof GTFSValidatorMessageSchema>;

/* VALIDATION */

export const GtfsValidationSchema = DocumentSchema.extend({
	feeder_status: ProcessingStatusSchema,
	file_id: z.string(),
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	notification_sent: z.boolean().default(false),
	summary: GTFSValidatorSummarySchema.nullish(),
}).strict();

export const CreateGtfsValidationSchema = GtfsValidationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateGtfsValidationSchema = CreateGtfsValidationSchema.omit({ created_by: true }).partial();

export type GtfsValidation = z.infer<typeof GtfsValidationSchema>;
export type CreateGtfsValidationDto = z.infer<typeof CreateGtfsValidationSchema>;
export type UpdateGtfsValidationDto = z.infer<typeof UpdateGtfsValidationSchema>;
