import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';

import { testDemandMetrics } from './demand.js';

/* * */

(async function init() {
	//

	LOGGER.title('Running All Tests');
	const timer = new TIMETRACKER();

	try {
		LOGGER.info('Starting demand metrics tests...');

		await testDemandMetrics();

		LOGGER.success(`All tests completed successfully in ${timer.get()}`);
	}
	catch (error) {
		LOGGER.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
	}

	//
})();
