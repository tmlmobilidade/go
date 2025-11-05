/* * */

import { syncRealtimeDemand } from '@/realtime/demand.js';
import { syncRealtimeServiceCompliance } from '@/realtime/serviceCompliance.js';
import TIMETRACKER from '@helperkits/timer';
import { Logs } from '@tmlmobilidade/go-utils';

/* * */

export const syncRealtimeMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new TIMETRACKER();

		Logs.title(`Starting Realtime Metrics Sync`);
		Logs.divider();

		//

		await syncRealtimeDemand(); // 2 seconds

		await syncRealtimeServiceCompliance(); // 24 seconds

		//

		Logs.divider();
		Logs.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
		Logs.divider();

		setTimeout(runOnInterval, 1_200_000); // 20 minutes
	};

	runOnInterval();

	//
};
