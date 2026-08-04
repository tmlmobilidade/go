/* * */

import { z } from 'zod';

/* * */

export const GradeStatusValues = [
	'pass',
	'fail',
	'error',
	'skipped',
] as const;

export const GradeStatusSchema = z.enum(GradeStatusValues);

export type GradeStatus = z.infer<typeof GradeStatusSchema>;
