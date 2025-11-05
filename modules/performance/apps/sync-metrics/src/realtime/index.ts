/* * */

import { syncRealtimeDemand } from '@/realtime/demand.js';
import { syncRealtimeServiceCompliance } from '@/realtime/serviceCompliance.js';
import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@go/utils-logger';

/* * */

export const syncRealtimeMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new TIMETRACKER();

		Logger.title(`Starting Realtime Metrics Sync`);
		Logger.divider();

		//

		await syncRealtimeDemand(); // 2 seconds

		await syncRealtimeServiceCompliance(); // 24 seconds

		//

		Logger.divider();
		Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
		Logger.divider();

		setTimeout(runOnInterval, 1_200_000); // 20 minutes
	};

	runOnInterval();

	//
};
