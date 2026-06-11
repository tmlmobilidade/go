/* * */

import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@/_common/status.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { RideAcceptanceStatusSchema } from '@/operation/rides/ride-acceptance.js';
import { RideAnalysisGradeSchema } from '@/operation/rides/ride-analysis.js';
import { z } from 'zod';

/* * */

const RideAnalysisGradeWithNoneSchema = RideAnalysisGradeSchema.or(z.literal('none'));

/* * */

export const GetRidesBatchQuerySchema = z.object({

	search: z
		.string()
		.optional(),

	/* * */

	agency_ids: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(id => id.trim()) : [], z.array(z.string()))
		.default([]),

	date_end: UnixTimestampSchema,

	date_start: UnixTimestampSchema,

	/* * */

	analysis_ended_at_last_stop_grade: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema))
		.optional(),

	analysis_expected_apex_validation_interval: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema))
		.optional(),

	analysis_simple_three_vehicle_events_grade: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema))
		.optional(),

	analysis_transaction_sequentiality: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(grade => grade.trim()) : [], z.array(RideAnalysisGradeWithNoneSchema))
		.optional(),

	/* * */

	delay_statuses: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(status => status.trim()) : [], z.array(DelayStatusSchema))
		.optional(),

	operational_statuses: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(status => status.trim()) : [], z.array(OperationalStatusSchema))
		.optional(),

	seen_statuses: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(status => status.trim()) : [], z.array(SeenStatusSchema))
		.optional(),

	/* * */

	line_ids: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(id => id.trim()) : [], z.array(z.string()))
		.optional(),

	stop_ids: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(id => id.trim()) : [], z.array(z.string()))
		.optional(),

	/* * */

	acceptance_status: z
		.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(status => status.trim()) : [], z.array(z.enum([...RideAcceptanceStatusSchema.options, 'none'])))
		.optional(),

	/* * */

	favorites: z
		.boolean()
		.optional(),
});

/* * */

export type GetRidesBatchQuery = z.infer<typeof GetRidesBatchQuerySchema>;
