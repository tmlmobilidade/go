/* * */

import { Annotation, Event, YearPeriod } from '@tmlmobilidade/types';

/* * */

export interface AnnotationNormalized extends Annotation {
	agency_ids_normalized: string
}

export interface PeriodNormalized extends YearPeriod {
	agency_ids_normalized: string
}

export interface HolidayNormalized extends Annotation {
	agency_ids_normalized: string
}

export interface EventNormalized extends Event {
	agency_ids_normalized: string
}
