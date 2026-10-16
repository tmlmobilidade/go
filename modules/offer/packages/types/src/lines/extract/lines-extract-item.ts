/* * */

import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const LinesExtractItemSchema = LineSchema.pick({
	_id: true,
	code: true,
	name: true,
});

export type LinesExtractItem = z.infer<typeof LinesExtractItemSchema>;
