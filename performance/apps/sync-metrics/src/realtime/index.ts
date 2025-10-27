/* * */

import { syncRealtimeDelays } from '@/realtime/delays.js';
import { syncRealtimeDemand } from '@/realtime/demand.js';
import { syncRealtimeServiceCompliance } from '@/realtime/serviceCompliance.js';
import TIMETRACKER from '@helperkits/timer';
import { Logs } from '@tmlmobilidade/utils';

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

		await syncRealtimeDelays(); // 15 seconds

		await syncRealtimeServiceCompliance(); // 13 seconds

		//

		Logs.divider();
		Logs.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
		Logs.divider();

		setTimeout(runOnInterval, 60_000); // 1 minute
	};

	runOnInterval();

	//
};
