/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const AgencyAlertsSchema = z.object({
	catalog: z.record(
		AlertCauseSchema,
		z.record(
			AlertEffectSchema,
			z.record(
				AlertReferenceTypeSchema,
				z.boolean().default(true),
			).default({}),
		).default({}),
	).default({}),
});

export type AgencyAlerts = z.infer<typeof AgencyAlertsSchema>;
