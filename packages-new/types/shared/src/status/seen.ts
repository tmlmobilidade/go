/* * */

import { z } from 'zod';

/* * */

export const SeenStatusValues = [
	'unseen',
	'seen',
	'gone',
] as const;

export const SeenStatusSchema = z.enum(SeenStatusValues);

export type SeenStatus = z.infer<typeof SeenStatusSchema>;
