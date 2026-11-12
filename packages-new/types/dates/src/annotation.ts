/* * */

import { LocationItemSchema } from '@tmlmobilidade/go-types-locations';
import { BaseDocumentSchema, OperationalDateIntSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { AnnotationCategorySchema } from './annotation-category.js';

/* * */

export const AnnotationSchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1),
	/** Null explicitly clears the category; absent on legacy annotations. */
	category: AnnotationCategorySchema.nullable().optional(),
	dates: z.array(OperationalDateIntSchema).default([]),
	description: z.string().optional(),
	/** Observed operational or data impact, separate from the event description. */
	impact: z.string().optional(),
	is_locked: z.boolean().default(false),
	/** OSM divisions at any administrative level, independent of agency assignment. */
	locations: z.array(LocationItemSchema).optional(),
	/** URL or free-text reference, e.g. an email subject or internal communication. */
	source: z.string().optional(),
	title: z.string().min(1),
});

export const CreateAnnotationSchema = AnnotationSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateAnnotationSchema = partialWithoutDefaults(CreateAnnotationSchema);

/* * */

export type Annotation = z.infer<typeof AnnotationSchema>;
export type CreateAnnotationDto = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotationDto = z.infer<typeof UpdateAnnotationSchema>;
