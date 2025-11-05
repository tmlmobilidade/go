/* * */

import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@go/utils-logger';

import { testDemandMetrics } from './demand.js';

/* * */

(async function init() {
	//

	Logger.title('Running All Tests');
	const timer = new TIMETRACKER();

	try {
		Logger.info('Starting demand metrics tests...');

		await testDemandMetrics();

		Logger.success(`All tests completed successfully in ${timer.get()}`);
	}
	catch (error) {
		Logger.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
	}

	//
})();
