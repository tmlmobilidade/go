/* * */

import { fastifyMultipart } from '@fastify/multipart';
import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('alerts', 'cors_origin'),
		port: getAppConfig('alerts', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	});

	await fastifyService.start();

	//
})();
