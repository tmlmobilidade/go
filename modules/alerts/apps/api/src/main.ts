/* * */

import { fastifyMultipart } from '@fastify/multipart';
import { getModuleConfig, HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getModuleConfig('alerts', 'cors_origin'),
		port: getModuleConfig('alerts', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	});

	await fastifyService.start();

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'alerts', message: 'Sentry Alerts API initialized', module: 'api', severity: 'info', status: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error('Error initializing Sentry Alerts API', { app: 'alerts', message: 'Error initializing Sentry Alerts API', module: 'api', severity: 'error', value: error });
	}
	//
})();
