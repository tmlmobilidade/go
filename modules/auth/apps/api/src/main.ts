/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('auth', 'cors_origin'),
		port: getAppConfig('auth', 'api_port'),
	});

	await fastifyService.start();

	//
})();
