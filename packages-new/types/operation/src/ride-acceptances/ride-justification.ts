/* * */

import { AlertCauseSchema } from '@/alerts/cause.js';
import { RideJustificationSourceSchema } from '@/ride-acceptances/justification-source.js';
import { BaseDocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideJustificationSchema = BaseDocumentSchema
	.omit({ _id: true, is_locked: true })
	.extend({
		justification_cause: AlertCauseSchema,
		justification_source: RideJustificationSourceSchema,
		manual_trip_id: z.string().optional(),
		pto_message: z.string().min(2).max(5000).default(''),
	});

export type RideJustification = z.infer<typeof RideJustificationSchema>;
