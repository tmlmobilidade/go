/* * */

import { backfillRidePerformance } from '@tmlmobilidade/go-performance-pckg-scripts';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const startValue = process.env.RIDE_PERFORMANCE_BACKFILL_START;
const endValue = process.env.RIDE_PERFORMANCE_BACKFILL_END;

if (!startValue || !endValue) {
	throw new Error('RIDE_PERFORMANCE_BACKFILL_START and RIDE_PERFORMANCE_BACKFILL_END are required (YYYYMMDD)');
}

const start = validateOperationalDateInt(startValue);
const end = validateOperationalDateInt(endValue);

Logger.title(`Backfilling Ride Performance (${start}–${end})`);
const result = await backfillRidePerformance(start, end);
if (!result.refreshed) {
	Logger.info({ message: 'Skipped ride-performance backfill because another refresh owns the lock.' });
} else {
	Logger.success(`Backfilled Ride Performance: ${result.source_rows_qty} rides across ${result.result_rows_qty} fact rows`);
}
Logger.terminate('Finished Ride Performance backfill');

/* * */
