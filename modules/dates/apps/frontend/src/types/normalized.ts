/* * */

import { Annotation, Period } from '@tmlmobilidade/types';

/* * */

export interface AnnotationNormalized extends Annotation {
	agency_ids_normalized: string
}

export interface PeriodNormalized extends Period {
	agency_id_normalized: string
}

export interface HolidayNormalized extends Annotation {
	agency_ids_normalized: string
}
