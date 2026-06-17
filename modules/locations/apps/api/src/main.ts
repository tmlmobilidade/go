/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'locations',
		origin: getModuleConfig('locations', 'cors_origin'),
		port: getModuleConfig('locations', 'api_port'),
	});

	await fastifyService.start();

	//
})();
