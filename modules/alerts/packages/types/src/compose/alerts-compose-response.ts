/* * */

import { I18nCodeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsComposeResponseSchema = z.record(I18nCodeSchema, z.object({
	description: z.string(),
	title: z.string(),
}));

/**
 * A response model for composing an alert.
 */
export type AlertsComposeResponse = z.infer<typeof AlertsComposeResponseSchema>;
