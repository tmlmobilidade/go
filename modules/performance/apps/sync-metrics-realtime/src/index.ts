/* * */

import { syncRealtimeDemand } from '@/tasks/sync-realtime-demand.js';
import { syncRealtimeServiceCompliance } from '@/tasks/sync-service-compliance.js';
// import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { runDemandByAgencyByOperationalDate } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

/* * */

async function main() {
	//

	const globalTimer = new Timer();

	Logger.title(`Starting Realtime Metrics Sync`);
	Logger.divider();

	//

	await syncRealtimeDemand();

	await syncRealtimeServiceCompliance();

	await runDemandByAgencyByOperationalDate('full');

	//

	// generatePerformanceSummary();

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
