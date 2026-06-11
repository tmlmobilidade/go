/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const FileSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		created_by: z.string(),
		description: z.string().nullish(),
		metadata: z.record(z.unknown()).nullish(),
		name: z.string(),
		resource_id: z.string(),
		scope: z.string(),
		size: z.number().describe('size in bytes'),
		type: z.string().describe('mime type'),
		updated_by: z.string(),
		url: z.string().nullish(),
	});

export const CreateFileSchema = FileSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateFileSchema = CreateFileSchema.omit({ created_by: true }).partial();

export type File = z.infer<typeof FileSchema>;
export type CreateFileDto = z.infer<typeof CreateFileSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileSchema>;
