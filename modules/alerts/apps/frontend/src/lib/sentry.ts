/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNextjs } from '@tmlmobilidade/logger/sentry/nextjs';

/* * */

export async function initSentry() {
	//

	try {
		await initSentryNextjs();
		Logger.info('');
		Logger.logsNextjs({ app: 'alerts', message: 'Sentry Alerts Frontend initialized', module: 'frontend', severity: 'info', status: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error('Error initializing Sentry Alerts Frontend', { app: 'alerts', message: 'Error initializing Sentry Alerts Frontend', module: 'frontend', severity: 'error', value: error });
	}

	//
}
