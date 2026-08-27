/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'infrastructure',
		origin: getModuleConfig('infrastructure', 'cors_origin'),
		port: getModuleConfig('infrastructure', 'api_port'),
	});

	await fastifyService.start();

	//
})();
