/* * */

import { NoteCommentSchema } from '@tmlmobilidade/go-types-shared';
import { type z } from 'zod';

/* * */

export const PatternsCommentRequestSchema = NoteCommentSchema.pick({ message: true }).extend({
	message: NoteCommentSchema.shape.message.trim().min(1).max(300),
});

export type PatternsCommentRequest = z.infer<typeof PatternsCommentRequestSchema>;
