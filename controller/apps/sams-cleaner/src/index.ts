/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { sams } from '@tmlmobilidade/interfaces';

/* * */

async function reprocessAllSams() {
	try {
		//

		LOGGER.init();

		//
		// Reset all SAMs to 'waiting' so they can be reprocessed

		const timer = new TIMETRACKER();

		const result = await sams.updateMany({}, { system_status: 'waiting' }, { returnResults: false });

		LOGGER.terminate(`Updated ${result.modifiedCount} SAMs. (${timer.get()})`);

		//
	}
	catch (err) {
		LOGGER.error('An error occurred. Halting execution.', err);
		LOGGER.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await reprocessAllSams();
		setTimeout(runOnInterval, 43_200_000); // 12 hours
	};
	runOnInterval();
})();
