/* * */

import { AlertCauseSchema } from '@/alerts/cause.js';
import { AlertEffectSchema } from '@/alerts/effect.js';
import { AlertReferenceTypeSchema } from '@/alerts/reference-type.js';
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
