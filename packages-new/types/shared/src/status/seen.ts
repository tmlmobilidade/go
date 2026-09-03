/* * */

import { z } from 'zod';

/* * */

export const SeenStatusValues = [
	'unseen',
	'seen',
	'gone',
] as const;

export const SeenStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(SeenStatusValues));

export type SeenStatus = z.infer<typeof SeenStatusSchema>;
