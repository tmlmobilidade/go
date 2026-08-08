/* * */

import { rebuildPassengerDemandHistory } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function rebuildDailyPassengerDemandHistory() {
	Logger.title('Rebuild Passenger Demand History');
	const timer = new Timer();
	const result = await rebuildPassengerDemandHistory();

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped passenger-demand history rebuild because the refresh lock remained unavailable.' });
		return;
	}

	Logger.success(`Rebuilt Passenger Demand History: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
