/* * */

import { ModuleIdSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ChangelogsPlatformRequestSchema = z.object({
	module_id: ModuleIdSchema.optional(),
});
export type ChangelogsPlatformRequest = z.infer<typeof ChangelogsPlatformRequestSchema>;
