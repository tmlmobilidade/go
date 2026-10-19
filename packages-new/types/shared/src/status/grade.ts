/* * */

import { z } from 'zod';

/* * */

export const GradeStatusValues = [
	'skip',
	'pass',
	'fail',
	'error',
] as const;

export const GradeStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(GradeStatusValues));

export type GradeStatus = z.infer<typeof GradeStatusSchema>;

/* * */

export const GradeStatusFilterValues = [...GradeStatusValues, 'none'] as const;

export const GradeStatusFilterSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(GradeStatusFilterValues));

export type GradeStatusFilter = z.infer<typeof GradeStatusFilterSchema>;
