/* * */

import { BaseDocumentSchema, OperationalDateIntSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AnnotationSchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1),
	dates: z.array(OperationalDateIntSchema).default([]),
	description: z.string().optional(),
	is_locked: z.boolean().default(false),
	title: z.string().min(1),
});

export const CreateAnnotationSchema = AnnotationSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateAnnotationSchema = partialWithoutDefaults(CreateAnnotationSchema);

/* * */

export type Annotation = z.infer<typeof AnnotationSchema>;
export type CreateAnnotationDto = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotationDto = z.infer<typeof UpdateAnnotationSchema>;
