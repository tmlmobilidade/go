/* * */

import { delayStatusOptions, operationalStatusOptions, seenStatusOptions } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { RideAcceptanceStatusSchema, RideAnalysisGradeSchema, validateUnixTimestamp } from '@tmlmobilidade/types';
import { z } from 'zod';

const RideAnalysisGradeWithNoneSchema = RideAnalysisGradeSchema.or(z.literal('none'));

export const GetRidesBatchQuerySchema = z.object({
	agency_ids: z.preprocess((val: string) => val ? val.split(',').map(id => id.trim()) : [], z.array(z.string())).optional(),
	search: z.string().optional(),

	/* * */

	analysis_ended_at_last_stop_grade: z.preprocess((val: string) => val ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema)).optional(),
	analysis_expected_apex_validation_interval: z.preprocess((val: string) => val ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema)).optional(),
	analysis_simple_three_vehicle_events_grade: z.preprocess((val: string) => val ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema)).optional(),
	analysis_transaction_sequentiality: z.preprocess((val: string) => val ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema)).optional(),

	/* * */

	date_end: z.coerce.number().transform(validateUnixTimestamp).brand('UnixTimestamp'),
	date_start: z.coerce.number().transform(validateUnixTimestamp).brand('UnixTimestamp'),

	/* * */

	delay_statuses: z.preprocess((val: string) => val ? val.split(',').map(status => status.trim()) : [], z.array(z.enum(delayStatusOptions))).optional(),
	operational_statuses: z.preprocess((val: string) => val ? val.split(',').map(status => status.trim()) : [], z.array(z.enum(operationalStatusOptions))).optional(),
	seen_statuses: z.preprocess((val: string) => val ? val.split(',').map(status => status.trim()) : [], z.array(z.enum(seenStatusOptions))).optional(),

	/* * */

	line_ids: z.preprocess((val: string) => val ? val.split(',').map(id => id.trim()) : [], z.array(z.string())).optional(),
	stop_ids: z.preprocess((val: string) => val ? val.split(',').map(id => id.trim()) : [], z.array(z.string())).optional(),

	/* * */
	acceptance_status: z.preprocess((val: string) => val ? val.split(',').map(status => status.trim()) : [], z.array(z.enum([...RideAcceptanceStatusSchema.options, 'none']))).optional(),
});

export type GetRidesBatchQuery = z.infer<typeof GetRidesBatchQuerySchema>;
