/* * */

import { publishDemandByAgencyMetrics } from '@/tasks/historical/demand-by-agency.js';
import { publishDemandByLineMetrics } from '@/tasks/historical/demand-by-line.js';
import { publishDemandByPatternMetrics } from '@/tasks/historical/demand-by-pattern.js';
import { publishPassengerDemandMetrics } from '@/tasks/realtime/passenger-demand.js';
import { publishRideMetrics } from '@/tasks/realtime/ride-metrics.js';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const historicalDemandTasks = [
	{ name: 'Historical Demand by Agency Metrics', run: publishDemandByAgencyMetrics },
	{ name: 'Historical Demand by Line Metrics', run: publishDemandByLineMetrics },
	{ name: 'Historical Demand by Pattern Metrics', run: publishDemandByPatternMetrics },
] as const;

const realtimeTasks = [
	{ name: 'Realtime Passenger Demand Metrics', run: publishPassengerDemandMetrics },
	{ name: 'Realtime Ride Metrics', run: publishRideMetrics },
] as const;

async function publishHistoricalDemandMetrics() {
	const failures: unknown[] = [];

	for (const task of historicalDemandTasks) {
		try {
			await task.run();
		} catch (error) {
			failures.push(error);
			Logger.error({ error, message: `Failed to publish ${task.name}` });
		}
	}

	if (failures.length) {
		throw new AggregateError(failures, 'One or more historical demand publications failed');
	}
}

const tasks = [
	{ name: 'Historical Demand Metrics', run: publishHistoricalDemandMetrics },
	...realtimeTasks,
] as const;

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'publish-metrics', message: 'Sentry Hub Publish Metrics initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Hub Publish Metrics' });
	}

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`Starting metrics data publishing...`);

	const globalTimer = new Timer();

	//
	// Run all tasks independently

	const results = await Promise.allSettled(tasks.map(task => task.run()));

	results.forEach((result, index) => {
		if (result.status === 'fulfilled') return;
		Logger.error({
			error: result.reason,
			message: `Failed to publish ${tasks[index]?.name}`,
		});
	});

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Finished publishing metrics data (${globalTimer.get()})`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
