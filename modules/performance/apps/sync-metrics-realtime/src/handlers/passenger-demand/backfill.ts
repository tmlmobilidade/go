/* * */

import { PASSENGER_DEMAND_TIMEZONE } from '@/handlers/passenger-demand/constants.js';
import { refreshDemandFacts } from '@/handlers/passenger-demand/demand-facts.js';
import { runTrackedRefresh } from '@/handlers/passenger-demand/refresh-tracker.js';
import { type RefreshRange } from '@/handlers/passenger-demand/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

export async function backfillPassengerDemand(
	start: OperationalDateInt,
	end: OperationalDateInt,
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
) {
	const range: RefreshRange = {
		cutoff: referenceNow.unix_timestamp,
		end,
		start,
		type: 'backfill',
	};

	await runTrackedRefresh(range, () => refreshDemandFacts(range));
}
