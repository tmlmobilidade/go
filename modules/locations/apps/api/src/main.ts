/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('locations', 'cors_origin'),
		port: getAppConfig('locations', 'api_port'),
	});

	await fastifyService.start();

	//
})();
