/* * */

import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { SimplifiedApexTypeSchema } from '@/simplified-apex/simplified-apex-type.js';
import { z } from 'zod';

/* * */

export const SamAnalysisSchema = z.object({
	apex_version: z.string().nullable(),
	device_id: z.string().nullable(),
	end_time: unixTimeStampSchema.nullable(),
	first_transaction_ase_counter_value: z.number().nullable(),
	first_transaction_id: z.string().nullable(),
	first_transaction_type: SimplifiedApexTypeSchema.nullable(),
	last_transaction_ase_counter_value: z.number().nullable(),
	last_transaction_id: z.string().nullable(),
	last_transaction_type: SimplifiedApexTypeSchema.nullable(),
	start_time: unixTimeStampSchema.nullable(),
	transactions_expected: z.number().nullable(),
	transactions_found: z.number().nullable(),
	transactions_missing: z.number().nullable(),
	vehicle_id: z.number().nullable(),
}).strict();

export type SamAnalysis = z.infer<typeof SamAnalysisSchema>;
