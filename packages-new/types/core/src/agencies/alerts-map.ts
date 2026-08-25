/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const AgencyAlertsMapSchema = z.record(
	AlertCauseSchema,
	z.record(
		AlertEffectSchema,
		z.record(
			AlertReferenceTypeSchema,
			z.boolean().default(true),
		).default({}),
	).default({}),
).default({});

/* * */

export type AgencyAlertsMap = z.infer<typeof AgencyAlertsMapSchema>;
