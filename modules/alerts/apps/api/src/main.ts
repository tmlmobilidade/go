/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('alerts', 'cors_origin'),
		port: getAppConfig('alerts', 'api_port'),
	});

	await fastifyService.start();

	//
})();
