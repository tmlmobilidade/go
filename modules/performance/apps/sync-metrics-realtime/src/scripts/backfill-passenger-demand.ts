/* * */

import { backfillPassengerDemand } from '@/handlers/passenger-demand/backfill.js';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const startValue = process.env.PASSENGER_DEMAND_BACKFILL_START;
const endValue = process.env.PASSENGER_DEMAND_BACKFILL_END;

if (!startValue || !endValue) {
	throw new Error(
		'PASSENGER_DEMAND_BACKFILL_START and PASSENGER_DEMAND_BACKFILL_END are required (YYYYMMDD)',
	);
}

const start = validateOperationalDateInt(startValue);
const end = validateOperationalDateInt(endValue);

if (start > end) {
	throw new Error('PASSENGER_DEMAND_BACKFILL_START must not be after PASSENGER_DEMAND_BACKFILL_END');
}

Logger.title(`Backfilling Passenger Demand Metrics (${start}–${end})`);
await backfillPassengerDemand(start, end);
Logger.terminate('Finished Passenger Demand Metrics backfill');
