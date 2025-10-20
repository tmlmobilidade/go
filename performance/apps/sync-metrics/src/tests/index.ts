/* * */

import TIMETRACKER from '@helperkits/timer';
import { Logs } from '@tmlmobilidade/utils';

import { testDemandMetrics } from './demand.js';

/* * */

(async function init() {
	//

	Logs.title('Running All Tests');
	const timer = new TIMETRACKER();

	try {
		Logs.info('Starting demand metrics tests...');

		await testDemandMetrics();

		Logs.success(`All tests completed successfully in ${timer.get()}`);
	}
	catch (error) {
		Logs.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
	}

	//
})();
