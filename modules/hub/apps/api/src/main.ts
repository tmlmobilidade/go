/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getModuleConfig('alerts', 'cors_origin'),
		port: getModuleConfig('alerts', 'api_port'),
	});

	await fastifyService.start();

	//
})();
