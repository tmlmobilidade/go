/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'controller',
		origin: getModuleConfig('controller', 'cors_origin'),
		port: getModuleConfig('controller', 'api_port'),
	});

	await fastifyService.start();

	//
})();
