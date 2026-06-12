/* * */

import { z } from 'zod';

/* * */

export const PublishStatusValues = [
	'published',
	'archived',
	'draft',
] as const;

export const PublishStatusSchema = z.enum(PublishStatusValues);

export type PublishStatus = z.infer<typeof PublishStatusSchema>;
