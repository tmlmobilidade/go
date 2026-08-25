/* * */

import { z } from 'zod';

/* * */

export const GradeStatusValues = [
	'skip',
	'pass',
	'fail',
	'error',
] as const;

export const GradeStatusSchema = z.enum(GradeStatusValues);

export type GradeStatus = z.infer<typeof GradeStatusSchema>;
