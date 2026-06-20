/* * */

import { demandByAgencyByOperationalDate } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt, validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

const AVAILABLE_TIMESPANS = ['full', 'realtime', 'weekly'] as const;

/**
 * Runs the demand by agency by operational date aggregation query.
 * for a given timespan (full, realtime, weekly).
 * @param timespan The timespan to run the aggregation query for.
 * @default 'realtime'
 */
export async function runDemandByAgencyByOperationalDate(timespan: typeof AVAILABLE_TIMESPANS[number]) {
	//

	//
	// Check if the span is valid

	if (!timespan) throw new Error('Timespan is required');
	if (!AVAILABLE_TIMESPANS.includes(timespan)) throw new Error(`Invalid timespan: ${timespan}`);

	//
	// Based on the given timespan, set the start date for the aggregation query.
	// By default, the start date is the current operational date to avoid re-running the query for the same date.

	let startDate: OperationalDateInt;

	switch (timespan) {
		case 'full':
			startDate = validateOperationalDateInt(20010101);
			break;
		case 'realtime':
			startDate = Dates
				.now('Europe/Lisbon')
				.minus({ days: 1 })
				.operational_date_int;
			break;
		case 'weekly':
			startDate = Dates
				.now('Europe/Lisbon')
				.minus({ weeks: 1 })
				.operational_date_int;
			break;
	}

	//
	// Run the aggregation query to populate the table

	await demandByAgencyByOperationalDate.delete('operational_date >= $1', { 1: startDate });

	await demandByAgencyByOperationalDate.queryFromFile('/Users/joao/Developer/tmlmobilidade/go/modules/performance/sql/demand/by-agency-by-operational-date.sql', {
		start_date: startDate,
	});
}
