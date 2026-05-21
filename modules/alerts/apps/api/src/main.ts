/* * */

import { fastifyMultipart } from '@fastify/multipart';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { initSentry } from '@tmlmobilidade/logger/server';

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

	Logger.init();
	initSentry().catch(() => {
		Logger.error(new Error('Error initializing Sentry:'), { message: 'Error initializing Sentry:', service: 'alerts-api' });
	});
	Logger.showAll({ message: 'Alerts API initialized', module: 'alerts', severity: 'info', tag: 'API' });

	await fastifyService.start();

	//
})();
