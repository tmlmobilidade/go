/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const AgencyAlertMapSchema = z.record(
	AlertCauseSchema,
	z.record(
		AlertEffectSchema,
		z.record(
			AlertReferenceTypeSchema,
			z.boolean().default(true),
		),
	),
);

/* * */

export type AgencyAlertMap = z.infer<typeof AgencyAlertMapSchema>;
