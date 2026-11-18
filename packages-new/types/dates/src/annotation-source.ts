import { validationMessage, validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

/* * */

export const AnnotationSourceUrlSchema = z.string().trim().url({ error: validationMessage('custom.dates.source_url') }).regex(/^https?:\/\//i, { error: validationMessage('custom.dates.source_url') });

export const AnnotationSourceSchema = z.object({
	name: z.string().trim().default(''),
	url: AnnotationSourceUrlSchema.nullable().default(null),
}).refine(source => !!source.name || !!source.url, {
	...validationParams('custom.dates.source_required'),
	path: ['name'],
});

export type AnnotationSource = z.infer<typeof AnnotationSourceSchema>;
