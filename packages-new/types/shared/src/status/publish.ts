/* * */

import { z } from 'zod';

/* * */

export const PublishStatusValues = [
	'published',
	'archived',
	'draft',
] as const;

export const PublishStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(PublishStatusValues));

export type PublishStatus = z.infer<typeof PublishStatusSchema>;
