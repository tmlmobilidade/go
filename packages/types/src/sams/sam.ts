/* * */

import { DocumentSchema } from '@/_common/document.js';
import { SystemStatusSchema } from '@/_common/system-status.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { SamAnalysisSchema } from '@/sams/sam-analysis.js';
import { z } from 'zod';

/* * */

export const SamSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		_id: z.number(),
		agency_id: z.string(),
		analysis: z.array(SamAnalysisSchema).default([]),
		latest_apex_version: z.string().nullable(),
		remarks: z.string().nullable().default(null),
		seen_first_at: UnixTimeStampSchema.nullable(),
		seen_last_at: UnixTimeStampSchema.nullable(),
		system_status: SystemStatusSchema.default('waiting'),
		transactions_expected: z.number().nullable(),
		transactions_found: z.number().nullable(),
		transactions_missing: z.number().nullable(),
	});

export const CreateSamSchema = SamSchema.omit({ created_at: true, updated_at: true });
export const UpdateSamSchema = CreateSamSchema.partial();

/**
 * SAMs are the chips that contain the keys used to sign APEX transactions.
 * They live in the validator machines and produce an incrementing counter value
 * every time a transaction is signed. This counter value is used to ensure that
 * the transactions are real, unique and incremental. This allows the system to
 * detect if a transaction has been tampered with or if any transactions are missing.
 */
export type Sam = z.infer<typeof SamSchema>;
export type CreateSamDto = z.infer<typeof CreateSamSchema>;
export type UpdateSamDto = z.infer<typeof UpdateSamSchema>;
