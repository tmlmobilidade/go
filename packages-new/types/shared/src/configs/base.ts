/* * */

import { z } from 'zod';

import { DocumentSchema } from '../documents/document.js';

/* * */

export const AppConfigBaseSchema = DocumentSchema.extend({
	_id: z.string(),
});

export type AppConfigBase = z.infer<typeof AppConfigBaseSchema>;
