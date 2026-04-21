/* * */

import fastifyMultipart from '@fastify/multipart';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

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

	//
})();
