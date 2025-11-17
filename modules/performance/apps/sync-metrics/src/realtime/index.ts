/* * */

import { syncRealtimeDemand } from '@/realtime/demand.js';
import { syncRealtimeServiceCompliance } from '@/realtime/serviceCompliance.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncRealtimeMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new Timer();

		Logger.title(`Starting Realtime Metrics Sync`);
		Logger.divider();

		//

		await syncRealtimeDemand();

		await syncRealtimeServiceCompliance();

		//

		Logger.divider();
		Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
		Logger.divider();

		setTimeout(runOnInterval, 30_000); // 30 seconds
	};

	runOnInterval();

	//
};
