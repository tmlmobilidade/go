/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

const COMMENT_TYPE_OPTIONS = ['field_changed', 'note', 'crud'] as const;
export const CommentTypeSchema = z.enum(COMMENT_TYPE_OPTIONS);
export type CommentType = z.infer<typeof CommentTypeSchema>;

const CRUD_COMMENT_ACTION_OPTIONS = ['create', 'update', 'delete', 'archive', 'restore'] as const;
export const CrudCommentSchemaActionSchema = z.enum(CRUD_COMMENT_ACTION_OPTIONS);
export type CrudCommentSchemaAction = z.infer<typeof CrudCommentSchemaActionSchema>;

/* * */

export const FieldChangeSchema = z.object({
	curr_value: z.any(),
	field: z.string(),
	prev_value: z.any(),
});

/* * */

export const NoteCommentSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		message: z.string(),
		type: z.literal(CommentTypeSchema.enum.note),
	})
	.partial({ _id: true });

export const FieldChangedCommentSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		curr_value: z.any(),
		field: z.string(),
		metadata: z.object({
			changes: z.array(FieldChangeSchema).optional(),
		}).nullish(),
		prev_value: z.any(),
		type: z.literal(CommentTypeSchema.enum.field_changed),
	})
	.partial({ _id: true });

export const CrudCommentSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		action: CrudCommentSchemaActionSchema,
		type: z.literal(CommentTypeSchema.enum.crud),
	})
	.partial({ _id: true });

/* * */

export const CommentSchema = z
	.discriminatedUnion('type', [
		NoteCommentSchema,
		FieldChangedCommentSchema,
		CrudCommentSchema,
	])
	.superRefine((data, ctx) => {
		// Apply validation after the discriminated union
		if (data.type === 'field_changed') {
			// If field is 'multiple_fields', metadata.changes must exist
			if (data.field === 'multiple_fields') {
				if (!data.metadata?.changes || data.metadata.changes.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'multiple_fields requires metadata.changes array',
						path: ['metadata', 'changes'],
					});
				}
				if (data.curr_value !== null || data.prev_value !== null) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'multiple_fields must have null curr_value and prev_value',
						path: ['curr_value'],
					});
				}
			}
			// If field is NOT 'multiple_fields', curr_value and prev_value must differ
			else if (data.curr_value === data.prev_value) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'curr_value and prev_value must differ',
					path: ['curr_value'],
				});
			}
		}
	});

/* * */

export type Comment = z.infer<typeof CommentSchema>;
export type NoteComment = z.infer<typeof NoteCommentSchema>;
export type CrudComment = z.infer<typeof CrudCommentSchema>;
export type FieldChangedComment = z.infer<typeof FieldChangedCommentSchema>;
export type FieldChange = z.infer<typeof FieldChangeSchema>;

// export interface FieldChangedComment<T, K extends keyof T> extends Omit<z.infer<typeof FieldChangedCommentSchema>, 'curr_value' | 'field' | 'prev_value'> {
// 	curr_value: T[K]
// 	field: K
// 	prev_value: T[K]
// }
