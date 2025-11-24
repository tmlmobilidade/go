/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		bodyLimit: 1024 * 1024 * 1024 * 2, // 2GB
		origin: getAppConfig('plans', 'cors_origin'),
		port: getAppConfig('plans', 'api_port'),
	});

	await fastifyService.start();

	//
})();
