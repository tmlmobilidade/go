/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SamAnalysisSchema = z.object({
	apex_version: z.string().nullable(),
	device_id: z.string().nullable(),
	end_time: UnixTimestampSchema.nullable(),
	first_transaction_ase_counter_value: z.number().nullable(),
	first_transaction_id: z.string().nullable(),
	first_transaction_type: z.string().nullable(), // SimplifiedApexTypeSchema
	last_transaction_ase_counter_value: z.number().nullable(),
	last_transaction_id: z.string().nullable(),
	last_transaction_type: z.string().nullable(), // SimplifiedApexTypeSchema
	start_time: UnixTimestampSchema.nullable(),
	transactions_expected: z.number(),
	transactions_found: z.number(),
	transactions_missing: z.number(),
	vehicle_id: z.number().nullable(),
});

export type SamAnalysis = z.infer<typeof SamAnalysisSchema>;
