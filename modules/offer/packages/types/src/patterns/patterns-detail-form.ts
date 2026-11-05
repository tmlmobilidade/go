/* * */

import { UpdatePatternSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

import { PatternsDetailPathItemSchema } from './patterns-detail.js';

/* * */

/** Editable Pattern fields, with populated stops retained only for the frontend. */
export const PatternsDetailFormSchema = UpdatePatternSchema.extend({
	path: z.array(PatternsDetailPathItemSchema).optional(),
});

export type PatternsDetailFormDto = z.infer<typeof PatternsDetailFormSchema>;
