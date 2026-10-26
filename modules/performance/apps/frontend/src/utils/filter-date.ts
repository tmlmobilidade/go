/* * */

import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/** Accepts the operational day input and the month/year picker string values. */
export function parsePerformanceFilterDate(value: null | OperationalDateInt | string): Dates | null {
	if (value === null) return null;
	return Dates.fromOperationalDateInt(OperationalDateIntSchema.parse(value), 'Europe/Lisbon');
}
