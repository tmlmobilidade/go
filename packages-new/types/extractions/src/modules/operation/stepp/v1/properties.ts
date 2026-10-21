/* * */

import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const ExtractionDateSchema = z.string().refine((value) => {
	try {
		return /^\d{8}$/.test(value) && !!validateOperationalDate(value);
	} catch {
		return false;
	}
}, 'Invalid operational date.').transform(value => value as OperationalDate);

/* * */

export const OperationGtfsSteppV1ExtractionPropertiesSchema = z.object({

	agency_id: z.string().trim().min(1),

	end_date: ExtractionDateSchema,

	start_date: ExtractionDateSchema,

}).refine(properties => properties.start_date <= properties.end_date, {
	message: 'The end date must be on or after the start date.',
	path: ['end_date'],
});

export type OperationGtfsSteppV1ExtractionProperties = z.infer<typeof OperationGtfsSteppV1ExtractionPropertiesSchema>;
