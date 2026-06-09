/* * */

import fastifyMultipart from '@fastify/multipart';
import { getModuleConfig, HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getModuleConfig('auth', 'cors_origin'),
		port: getModuleConfig('auth', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	});

	await fastifyService.start();

	// Initialize Sentry

	//
	try {
		await initSentryNode();
		Logger.logsNode({ app: 'auth', message: 'Sentry Auth API initialized', module: 'auth', severity: 'info', status: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error('Error initializing Sentry Auth API', { app: 'auth', message: 'Error initializing Sentry Auth API', module: 'auth', severity: 'error', value: error });
	}

	//
})();
