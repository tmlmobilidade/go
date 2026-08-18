/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsComposeRequestSchema = z.object({

	active_period_end_date: UnixTimestampSchema,

	active_period_start_date: UnixTimestampSchema,

	agency_id: z.string(),

	cause: AlertCauseSchema,

	effect: AlertEffectSchema,

	reference_type: AlertReferenceTypeSchema,

	references: z.array(AlertReferenceSchema),

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
 * A request model for composing an alert.
 */
export type AlertsComposeRequest = z.infer<typeof AlertsComposeRequestSchema>;
