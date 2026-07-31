/* * */

import { DocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AnnotationSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	dates: z.array(OperationalDateSchema).default([]),
	description: z.string().optional(),
	is_locked: z.boolean().default(false),
	title: z.string().min(1),
});

export const CreateAnnotationSchema = AnnotationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateAnnotationSchema = CreateAnnotationSchema.omit({ created_by: true }).partial();

/* * */

export type Annotation = z.infer<typeof AnnotationSchema>;
export type CreateAnnotationDto = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotationDto = z.infer<typeof UpdateAnnotationSchema>;
