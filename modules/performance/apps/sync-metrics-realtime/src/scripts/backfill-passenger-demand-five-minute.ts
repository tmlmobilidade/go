/* * */

import { backfillPassengerDemandFiveMinute } from '@tmlmobilidade/go-performance-pckg-scripts';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const startValue = process.env.PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_START;
const endValue = process.env.PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_END;

if (!startValue || !endValue) {
	throw new Error(
		'PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_START and PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_END are required (YYYYMMDD)',
	);
}

const start = validateOperationalDateInt(startValue);
const end = validateOperationalDateInt(endValue);

if (start > end) {
	throw new Error('PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_START must not be after PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_END');
}

Logger.title(`Backfilling Five-Minute Passenger Demand (${start}–${end})`);
const result = await backfillPassengerDemandFiveMinute(start, end);

if (!result.refreshed) {
	Logger.info({ message: 'Skipped five-minute passenger-demand backfill because another refresh owns the lock.' });
} else {
	Logger.success(`Backfilled Five-Minute Passenger Demand: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows`);
}

Logger.terminate('Finished Five-Minute Passenger Demand backfill');

/* * */
