/* * */

import { I18nCodeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsDescribeResponseSchema = z.record(I18nCodeSchema, z.object({
	description: z.string(),
	title: z.string(),
}));

/**
 * A response model for describing an alert.
 */
export type AlertsDescribeResponse = z.infer<typeof AlertsDescribeResponseSchema>;
