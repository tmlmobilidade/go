/* * */

import { Logger } from '@tmlmobilidade/logger';
import { initSentryNextjs } from '@tmlmobilidade/logger/sentry/nextjs';

/* * */

(async function () {
	//

	try {
		await initSentryNextjs();
		Logger.info('Sentry Alerts Frontend initialized');
		Logger.logsNextjs({
			app: 'alerts',
			message: 'Sentry Alerts Frontend initialized',
			module: 'frontend',
			severity: 'info',
		});
	} catch (error) {
		Logger.error([], {
			action: 'initSentryNextjs',
			feature: 'alerts',
			message: 'Error initializing Sentry Alerts Frontend',
			request: undefined,
			service: 'frontend',
			value: error,
		});
	}

	//
})();
