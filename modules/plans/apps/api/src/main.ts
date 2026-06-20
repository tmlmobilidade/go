/* * */

import fastifyMultipart from '@fastify/multipart';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		bodyLimit: 1024 * 1024 * 1024 * 2, // 2GB
		module: 'plans',
		origin: getModuleConfig('plans', 'cors_origin'),
		port: getModuleConfig('plans', 'api_port'),
	});

	await fastifyService.server.register(fastifyMultipart, {
		limits: { fileSize: 1024 * 1024 * 1024 * 2 },
	});

	await fastifyService.start();

	//
})();
