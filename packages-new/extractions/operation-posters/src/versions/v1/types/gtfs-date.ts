/* * */

import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

export interface GtfsDate {
	date: OperationalDate
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes?: string
	period: '1' | '2' | '3'
}
