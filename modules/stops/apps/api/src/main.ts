/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'stops',
		origin: getModuleConfig('stops', 'cors_origin'),
		port: getModuleConfig('stops', 'api_port'),
	});

	await fastifyService.start();

	//
})();
