import { AnnotationCategorySchema } from '@tmlmobilidade/go-types-dates';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DatesAnnotationsV1WithoutAgencyValue = '__unassigned__';
export const DatesAnnotationsV1WithoutCategoryValue = '__uncategorized__';
export const DatesAnnotationsV1WithoutLocationValue = '__unlocated__';

/** Empty filter selections mean no restriction; permissions are always checked by the worker. */
export const DatesAnnotationsV1ExtractionPropertiesSchema = z.object({
	agency_ids: z.array(z.string().min(1)).default([]),
	/** Optional selection retained for jobs submitted before editable filters were introduced. */
	annotation_ids: z.array(z.string().min(1)).min(1).optional(),
	categories: z.array(z.union([AnnotationCategorySchema, z.literal(DatesAnnotationsV1WithoutCategoryValue)])).default([]),
	end_date: OperationalDateIntSchema.nullable().default(null),
	location_ids: z.array(z.union([z.string().regex(/^[1-9]\d*$/), z.literal(DatesAnnotationsV1WithoutLocationValue)])).default([]),
	start_date: OperationalDateIntSchema.nullable().default(null),
}).refine(value => !value.start_date || !value.end_date || value.start_date <= value.end_date, {
	message: 'End date must be on or after start date',
	path: ['end_date'],
});

export type DatesAnnotationsV1ExtractionProperties = z.infer<typeof DatesAnnotationsV1ExtractionPropertiesSchema>;
