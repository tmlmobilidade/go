/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsDescribeRequestSchema = z.object({

	active_period_end_date: UnixTimestampSchema,

	active_period_start_date: UnixTimestampSchema,

	agency_id: z.string(),

	cause: AlertCauseSchema,

	effect: AlertEffectSchema,

	reference_type: AlertReferenceTypeSchema,

	references_data: z.array(
		z.object({
			child_ids: z.array(
				z.object({
					id: z.string(),
					label: z.string(),
				}),
			),
			label: z.string(),
			parent_id: z.string(),
		}),
	),

	user_instructions: z
		.string()
		.nullable()
		.default(null)
		.transform((value) => {
			if (!value) return null;
			return value
				.normalize('NFKC') // Normalize the text to NFC
				.replaceAll('\n', ' ') // Replace newlines with spaces
				.replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
				.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
				.replace(/!{2,}/g, m => m.split('').join('\\!')) // Replace multiple exclamation marks with a single exclamation mark
				.replace(/#{2,}/g, m => m.split('').join('\\#')) // Replace multiple hashes with a single hash
				.replace(/`{3,}/g, m => m.split('').join('\\`')); // Replace multiple backticks with a single backtick
		}),

});

/**
 * A request model for describing an alert.
 */
export type AlertsDescribeRequest = z.infer<typeof AlertsDescribeRequestSchema>;
