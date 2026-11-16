/* * */

import { z } from 'zod';

/* * */

export const AnnotationCategoryValues = [
	'weather',
	'accident',
	'roadworks_restrictions',
	'strike_worker_meeting',
	'public_event_protest',
	'technology_data_failure',
	'transport_disruption',
	'school_calendar_change',
	'fare_policy_change',
	'other',
] as const;

export const AnnotationCategorySchema = z.enum(AnnotationCategoryValues);

export type AnnotationCategory = z.infer<typeof AnnotationCategorySchema>;
