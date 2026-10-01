/* * */

import fastifyMultipart from '@fastify/multipart';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'core',
		origin: getModuleConfig('core', 'cors_origin'),
		port: getModuleConfig('core', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	});

	await fastifyService.start();

	//
})();
