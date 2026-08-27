/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'schools',
		origin: getModuleConfig('schools', 'cors_origin'),
		port: getModuleConfig('schools', 'api_port'),
	});

	await fastifyService.start();

	//
})();
