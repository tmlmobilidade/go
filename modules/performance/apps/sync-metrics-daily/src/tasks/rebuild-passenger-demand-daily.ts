/* * */

import { rebuildPassengerDemandDailyFact } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function rebuildPassengerDemandDaily() {
	Logger.title('Rebuild Daily Passenger Demand');
	const timer = new Timer();
	const result = await rebuildPassengerDemandDailyFact();

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped daily passenger-demand rebuild because the refresh lock remained unavailable.' });
		return;
	}

	Logger.success(`Rebuilt Daily Passenger Demand: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
