/* * */

import { fastifyMultipart } from '@fastify/multipart';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';

/* * */

(async function () {
	//

	try {
		await initSentryNode();
		Logger.info('Sentry Alerts API initialized');
		Logger.logsNode({ app: 'alerts', message: 'Sentry Alerts API initialized', module: 'api', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Alerts API', { app: 'alerts', message: 'Error initializing Sentry Alerts API', module: 'api', severity: 'error', value: error });
	}

	const fastifyService = FastifyService.getInstance({
		origin: getModuleConfig('alerts', 'cors_origin'),
		port: getModuleConfig('alerts', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	});

	await fastifyService.start();

	//
})();
