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

export const NoteCommentSchema = DocumentSchema.extend({
	message: z.string(),
	type: z.literal(CommentTypeSchema.enum.note),
}).partial({ _id: true });

export const FieldChangedCommentSchema = DocumentSchema.extend({
	curr_value: z.any(),
	field: z.string(),
	metadata: z.record(z.unknown()).nullish(),
	prev_value: z.any(),
	type: z.literal(CommentTypeSchema.enum.field_changed),
}).partial({ _id: true });

export const CrudCommentSchema = DocumentSchema.extend({
	action: CrudCommentSchemaActionSchema,
	type: z.literal(CommentTypeSchema.enum.crud),
}).partial({ _id: true });

/* * */

function validateFieldChanged(data: Pick<z.infer<typeof FieldChangedCommentSchema>, 'curr_value' | 'prev_value'>, ctx: z.RefinementCtx) {
	if (data.curr_value === data.prev_value) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'curr_value and prev_value must differ',
			path: ['curr_value'],
		});
	}
}

/* * */

export const CommentSchema = z
	.discriminatedUnion('type', [
		NoteCommentSchema,
		FieldChangedCommentSchema,
		CrudCommentSchema,
	])
	.superRefine((data, ctx) => {
		if (data.type === CommentTypeSchema.enum.field_changed) {
			validateFieldChanged(data, ctx);
		}
	});

/* * */

export type Comment = z.infer<typeof CommentSchema>;
export type NoteComment = z.infer<typeof NoteCommentSchema>;
export type CrudComment = z.infer<typeof CrudCommentSchema>;
export interface FieldChangedComment<T, K extends keyof T> extends Omit<z.infer<typeof FieldChangedCommentSchema>, 'curr_value' | 'field' | 'prev_value'> {
	curr_value: T[K]
	field: K
	prev_value: T[K]
}
