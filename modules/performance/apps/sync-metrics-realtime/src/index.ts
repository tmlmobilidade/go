/* * */

import { syncRealtimeDemand } from '@/tasks/sync-realtime-demand.js';
import { syncRealtimeServiceCompliance } from '@/tasks/sync-service-compliance.js';
import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

await (async function init() {
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

		generatePerformanceSummary();

		//

		Logger.divider();
		Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
		Logger.divider();

		setTimeout(runOnInterval, 120_000); // 2 minutes
	};

	runOnInterval();

	//
})();
