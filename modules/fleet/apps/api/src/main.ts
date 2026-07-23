/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		bodyLimit: 1024 * 1024 * 1024 * 2, // 2GB
		module: 'fleet',
		origin: getModuleConfig('fleet', 'cors_origin'),
		port: getModuleConfig('fleet', 'api_port'),
	});

	await fastifyService.start();

	//
})();
