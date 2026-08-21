/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AppConfigBaseSchema = DocumentSchema.extend({
	_id: z.string(),
});

export type AppConfigBase = z.infer<typeof AppConfigBaseSchema>;
