/* * */

import { publishPassengerDemandMetrics } from '@/tasks/passenger-demand.js';
import { publishRideMetrics } from '@/tasks/ride-metrics.js';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const tasks = [
	{ name: 'Passenger Demand Metrics', run: publishPassengerDemandMetrics },
	{ name: 'Ride Metrics', run: publishRideMetrics },
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
