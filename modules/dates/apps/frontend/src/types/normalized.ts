/* * */

import { type Annotation, type Event, type YearPeriod } from '@tmlmobilidade/go-types-offer';

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
