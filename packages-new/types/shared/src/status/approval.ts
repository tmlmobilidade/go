/* * */

import { z } from 'zod';

/* * */

export const ApprovalStatusValues = [
	'pending',
	'approved',
	'rejected',
	'none',
] as const;

export const ApprovalStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ApprovalStatusValues));

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
